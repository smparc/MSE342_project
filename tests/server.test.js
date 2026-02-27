const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');

// ─── Mock mysql2/promise pool ─────────────────────────────────────────────────
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

// ─── Mock fs & multer so file system isn't touched ───────────────────────────
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

jest.mock('multer', () => {
  const multerMock = () => ({
    single: () => (req, res, next) => next(),
  });
  multerMock.diskStorage = jest.fn(() => ({}));
  return multerMock;
});

const app = require('../server');
const pool = mysql.createPool();

// ─── Helper: reset all mock calls between tests ───────────────────────────────
beforeEach(() => {
  pool.query.mockReset();
});

// =============================================================================
// COURSE EQUIVALENCY ROUTES
// =============================================================================

describe('GET /api/courses', () => {
  test('AC#1 — returns courses filtered by host university', async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])   // count query
      .mockResolvedValueOnce([[{                  // results query
        course_id: 1,
        uw_course_code: 'MSCI 342',
        uw_course_name: 'Engineering Economics',
        host_course_code: 'BUS 201',
        host_course_name: 'Business Economics',
        host_university: 'University of Melbourne',
        country: 'Australia',
        continent: 'Oceania',
        term_taken: 'Fall 2023',
        status: 'Approved',
        last_updated: new Date(),
      }]]);

    const res = await request(app)
      .get('/api/courses')
      .query({ university: 'Melbourne' });

    expect(res.statusCode).toBe(200);
    expect(res.body.courses).toHaveLength(1);
    expect(res.body.courses[0].host_university).toBe('University of Melbourne');
  });

  test('AC#3 — filters by country AND faculty simultaneously', async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 2 }]])
      .mockResolvedValueOnce([[
        { course_id: 1, uw_course_code: 'MSCI 342', country: 'Australia', host_university: 'U Melbourne' },
        { course_id: 2, uw_course_code: 'MSCI 261', country: 'Australia', host_university: 'U Sydney' },
      ]]);

    const res = await request(app)
      .get('/api/courses')
      .query({ country: 'Australia', faculty: 'MSCI' });

    expect(res.statusCode).toBe(200);
    expect(res.body.courses).toHaveLength(2);
    // Verify both filter params were used — pool.query should have been called with LIKE params
    const queryCall = pool.query.mock.calls[1][1];
    expect(queryCall).toContain('Australia');
    expect(queryCall.some(p => String(p).includes('MSCI'))).toBe(true);
  });

  test('AC#4 — returns empty array with no results for unmatched search', async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 0 }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/api/courses')
      .query({ q: 'xyznonexistentuniversity' });

    expect(res.statusCode).toBe(200);
    expect(res.body.courses).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  test('AC#5 — partial university name search returns matching courses', async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{
        course_id: 3,
        host_university: 'University of Melbourne',
        uw_course_code: 'CS 341',
      }]]);

    const res = await request(app)
      .get('/api/courses')
      .query({ q: 'Melb' });

    expect(res.statusCode).toBe(200);
    expect(res.body.courses).toHaveLength(1);
    // Confirm LIKE %Melb% pattern was used
    const queryParams = pool.query.mock.calls[0][1];
    expect(queryParams.some(p => String(p).includes('Melb'))).toBe(true);
  });

  test('AC#6 — pagination returns correct page and limit', async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 50 }]])
      .mockResolvedValueOnce([[{ course_id: 16, uw_course_code: 'ECE 405' }]]);

    const res = await request(app)
      .get('/api/courses')
      .query({ page: 2, limit: 15 });

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(15);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  test('AC#7 — course cards include all required fields', async () => {
    const mockCourse = {
      course_id: 1,
      host_course_code: 'BUS 201',
      host_course_name: 'Business Economics',
      uw_course_code: 'MSCI 342',
      host_university: 'U Melbourne',
      country: 'Australia',
      term_taken: 'Fall 2023',
      last_updated: new Date(),
      status: 'Approved',
    };

    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[mockCourse]]);

    const res = await request(app).get('/api/courses');

    expect(res.statusCode).toBe(200);
    const course = res.body.courses[0];
    expect(course).toHaveProperty('host_course_code');
    expect(course).toHaveProperty('uw_course_code');
    expect(course).toHaveProperty('host_university');
    expect(course).toHaveProperty('country');
    expect(course).toHaveProperty('term_taken');
    expect(course).toHaveProperty('last_updated');
  });

  test('AC#8 — strips invalid characters from search query', async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 0 }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/api/courses')
      .query({ q: 'Melbourne<script>alert(1)</script>' });

    expect(res.statusCode).toBe(200);
    // Confirm the injected characters were stripped
    const queryParams = pool.query.mock.calls[0][1];
    const usedParam = queryParams.find(p => String(p).includes('Melbourne'));
    expect(usedParam).toBeDefined();
    expect(usedParam).not.toContain('<script>');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/courses/:id', () => {
  test('AC#2 & AC#9 — returns exact UW credit code and last_updated date', async () => {
    pool.query.mockResolvedValueOnce([[{
      course_id: 1,
      uw_course_code: 'MSCI 342',
      uw_course_name: 'Engineering Economics',
      host_course_code: 'BUS 201',
      host_course_name: 'Business Economics',
      host_university: 'University of Melbourne',
      last_updated: '2024-09-01T00:00:00.000Z',
      display_name: 'Test User',
      status: 'Approved',
    }]]);

    const res = await request(app).get('/api/courses/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.uw_course_code).toBe('MSCI 342');
    expect(res.body.last_updated).toBeDefined();
  });

  test('returns 404 for non-existent course', async () => {
    pool.query.mockResolvedValueOnce([[]]); // empty result

    const res = await request(app).get('/api/courses/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Course not found');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/courses/meta/filters', () => {
  test('returns all distinct filter dropdown values', async () => {
    pool.query
      .mockResolvedValueOnce([[{ country: 'Australia' }, { country: 'Germany' }]])
      .mockResolvedValueOnce([[{ continent: 'Oceania' }, { continent: 'Europe' }]])
      .mockResolvedValueOnce([[{ term_taken: 'Fall 2023' }]])
      .mockResolvedValueOnce([[{ host_university: 'U Melbourne' }]]);

    const res = await request(app).get('/api/courses/meta/filters');

    expect(res.statusCode).toBe(200);
    expect(res.body.countries).toContain('Australia');
    expect(res.body.continents).toContain('Europe');
    expect(res.body.terms).toContain('Fall 2023');
    expect(res.body.universities).toContain('U Melbourne');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/courses', () => {
  const validBody = {
    username: 'testuser',
    uw_course_code: 'MSCI 342',
    uw_course_name: 'Engineering Economics',
    host_course_code: 'BUS 201',
    host_course_name: 'Business Economics',
    host_university: 'University of Melbourne',
    country: 'Australia',
    continent: 'Oceania',
    term_taken: 'Fall 2023',
    proof_url: 'https://example.com/proof.pdf',
  };

  test('AC#1 upload — successfully stores course with all required fields', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 42 }]);

    const res = await request(app).post('/api/courses').send(validBody);

    expect(res.statusCode).toBe(201);
    expect(res.body.course_id).toBe(42);
    expect(res.body.status).toBe('Pending Review');
  });

  test('AC#2 upload — rejects submission with missing required field', async () => {
    const { host_university, ...incomplete } = validBody;

    const res = await request(app).post('/api/courses').send(incomplete);

    expect(res.statusCode).toBe(400);
    expect(res.body.fields).toContain('host_university');
  });

  test('AC#4 upload — rejects duplicate course equivalency submission', async () => {
    const dupError = new Error('Duplicate entry');
    dupError.code = 'ER_DUP_ENTRY';
    pool.query.mockRejectedValueOnce(dupError);

    const res = await request(app).post('/api/courses').send(validBody);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already been submitted/i);
  });

  test('AC#5 upload — rejects invalid UW course code format', async () => {
    const res = await request(app)
      .post('/api/courses')
      .send({ ...validBody, uw_course_code: 'INVALID###' });

    expect(res.statusCode).toBe(400);
    expect(res.body.field).toBe('uw_course_code');
  });

  test('AC#9 upload — rejects submission without proof', async () => {
    const { proof_url, ...noProof } = validBody;

    const res = await request(app).post('/api/courses').send(noProof);

    expect(res.statusCode).toBe(400);
    expect(res.body.field).toBe('proof_url');
  });

  test('AC#10 upload — new submission is marked Pending Review', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app).post('/api/courses').send(validBody);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('Pending Review');
    // Confirm the INSERT used 'Pending Review'
    const insertSQL = pool.query.mock.calls[0][0];
    expect(insertSQL).toContain('Pending Review');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('PUT /api/courses/:id', () => {
  test('AC#7 upload — successfully updates an existing course submission', async () => {
    pool.query
      .mockResolvedValueOnce([[{ course_id: 1, username: 'testuser' }]]) // SELECT existing
      .mockResolvedValueOnce([{ affectedRows: 1 }]);                      // UPDATE

    const res = await request(app)
      .put('/api/courses/1')
      .send({
        username: 'testuser',
        uw_course_code: 'MSCI 342',
        uw_course_name: 'Engineering Economics Updated',
        host_course_code: 'BUS 202',
        host_course_name: 'Advanced Business Economics',
        host_university: 'University of Melbourne',
        country: 'Australia',
        continent: 'Oceania',
        term_taken: 'Winter 2024',
        proof_url: 'https://example.com/proof2.pdf',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  test('returns 404 if course does not belong to the user', async () => {
    pool.query.mockResolvedValueOnce([[]]); // No matching course for this user

    const res = await request(app)
      .put('/api/courses/99')
      .send({ username: 'wronguser', uw_course_code: 'CS 341', uw_course_name: 'x',
              host_course_code: 'x', host_course_name: 'x', host_university: 'x' });

    expect(res.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Saved Courses', () => {
  test('GET /api/users/:username/saved-courses — returns user shortlist', async () => {
    pool.query.mockResolvedValueOnce([[
      { course_id: 1, uw_course_code: 'MSCI 342', saved_at: new Date() },
      { course_id: 2, uw_course_code: 'CS 341', saved_at: new Date() },
    ]]);

    const res = await request(app).get('/api/users/testuser/saved-courses');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('POST — saves a new course to shortlist', async () => {
    pool.query
      .mockResolvedValueOnce([[]])                     // SELECT — not yet saved
      .mockResolvedValueOnce([{ affectedRows: 1 }]);   // INSERT

    const res = await request(app)
      .post('/api/users/testuser/saved-courses')
      .send({ course_id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.saved).toBe(true);
  });

  test('POST — removes course from shortlist if already saved (toggle)', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 5 }]])            // SELECT — already saved
      .mockResolvedValueOnce([{ affectedRows: 1 }]);   // DELETE

    const res = await request(app)
      .post('/api/users/testuser/saved-courses')
      .send({ course_id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.saved).toBe(false);
  });
});

// =============================================================================
// TIMELINE / MILESTONES ROUTES
// =============================================================================

describe('GET /api/users/:username/milestones', () => {
  const now = new Date();
  const in30h = new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString();   // 30hrs away
  const in5d  = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days away
  const past  = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();   // yesterday

  test('AC#1 — returns calendar view of all milestones', async () => {
    pool.query.mockResolvedValueOnce([[
      { milestone_id: 1, title: 'Submit Study Plan', deadline_utc: in5d,
        milestone_type: 'UW Internal', is_completed: false,
        prerequisite_id: null, prerequisite_completed: null },
    ]]);

    const res = await request(app).get('/api/users/testuser/milestones');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Submit Study Plan');
  });

  test('AC#2 — milestone within 48h is flagged as approaching', async () => {
    pool.query.mockResolvedValueOnce([[
      { milestone_id: 1, title: 'Urgent Task', deadline_utc: in30h,
        milestone_type: 'UW Internal', is_completed: false,
        prerequisite_id: null, prerequisite_completed: null },
    ]]);

    const res = await request(app).get('/api/users/testuser/milestones');

    expect(res.statusCode).toBe(200);
    expect(res.body[0].is_approaching_48h).toBe(true);
  });

  test('AC#4 — milestone within 7 days is flagged', async () => {
    pool.query.mockResolvedValueOnce([[
      { milestone_id: 2, title: 'Submit Housing Form', deadline_utc: in5d,
        milestone_type: 'Host University', is_completed: false,
        prerequisite_id: null, prerequisite_completed: null },
    ]]);

    const res = await request(app).get('/api/users/testuser/milestones');

    expect(res.statusCode).toBe(200);
    expect(res.body[0].is_approaching_7d).toBe(true);
  });

  test('AC#9 — filter by UW Internal type only', async () => {
    pool.query.mockResolvedValueOnce([[
      { milestone_id: 1, title: 'UW Nomination', deadline_utc: in5d,
        milestone_type: 'UW Internal', is_completed: false,
        prerequisite_id: null, prerequisite_completed: null },
    ]]);

    const res = await request(app)
      .get('/api/users/testuser/milestones')
      .query({ type: 'UW Internal' });

    expect(res.statusCode).toBe(200);
    // Confirm type filter was passed to the SQL query
    const queryParams = pool.query.mock.calls[0][1];
    expect(queryParams).toContain('UW Internal');
  });

  test('AC#7 — locked milestone has prerequisite info included', async () => {
    pool.query.mockResolvedValueOnce([[
      { milestone_id: 2, title: 'Apply to Host University', deadline_utc: in5d,
        milestone_type: 'Host University', is_completed: false,
        prerequisite_id: 1,
        prerequisite_title: 'UW Nomination',
        prerequisite_completed: false },
    ]]);

    const res = await request(app).get('/api/users/testuser/milestones');

    expect(res.statusCode).toBe(200);
    expect(res.body[0].prerequisite_id).toBe(1);
    expect(res.body[0].prerequisite_title).toBe('UW Nomination');
    expect(res.body[0].prerequisite_completed).toBe(false);
  });

  test('AC#10 — completed milestone includes buffer_days', async () => {
    const futureDeadline = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();

    pool.query.mockResolvedValueOnce([[
      { milestone_id: 3, title: 'Submit Application', deadline_utc: futureDeadline,
        milestone_type: 'UW Internal', is_completed: true,
        prerequisite_id: null, prerequisite_completed: null },
    ]]);

    const res = await request(app).get('/api/users/testuser/milestones');

    expect(res.statusCode).toBe(200);
    expect(res.body[0].buffer_days).not.toBeNull();
    expect(res.body[0].buffer_days).toBeGreaterThan(0);
  });

  test('overdue milestone is flagged correctly', async () => {
    pool.query.mockResolvedValueOnce([[
      { milestone_id: 4, title: 'Overdue Task', deadline_utc: past,
        milestone_type: 'UW Internal', is_completed: false,
        prerequisite_id: null, prerequisite_completed: null },
    ]]);

    const res = await request(app).get('/api/users/testuser/milestones');

    expect(res.statusCode).toBe(200);
    expect(res.body[0].is_overdue).toBe(true);
    expect(res.body[0].is_approaching_48h).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/users/:username/milestones', () => {
  test('AC#1 — creates a new milestone successfully', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 10 }]);

    const res = await request(app)
      .post('/api/users/testuser/milestones')
      .send({
        title: 'Submit Study Plan',
        deadline_utc: '2025-03-01T23:59:00',
        milestone_type: 'UW Internal',
        form_link: 'https://waterlooabroad.uwaterloo.ca',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.milestone_id).toBe(10);
  });

  test('rejects milestone missing required fields', async () => {
    const res = await request(app)
      .post('/api/users/testuser/milestones')
      .send({ title: 'Missing deadline' }); // no deadline_utc or milestone_type

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('PATCH /api/milestones/:id', () => {
  test('AC#3 — marks a milestone as complete', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .patch('/api/milestones/1')
      .send({ is_completed: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
    // Confirm is_completed=true was passed to the query
    const queryParams = pool.query.mock.calls[0][1];
    expect(queryParams).toContain(true);
  });

  test('returns 400 if no fields are provided to update', async () => {
    const res = await request(app)
      .patch('/api/milestones/1')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/nothing to update/i);
  });

  test('updates form_link on a milestone', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .patch('/api/milestones/2')
      .send({ form_link: 'https://newlink.com' });

    expect(res.statusCode).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('DELETE /api/milestones/:id', () => {
  test('deletes a milestone successfully', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/api/milestones/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/users/:username/milestones/export', () => {
  test('AC#8 — returns a valid .ics file', async () => {
    pool.query.mockResolvedValueOnce([[
      { milestone_id: 1, title: 'Submit Study Plan',
        deadline_utc: '2025-03-01T23:59:00',
        milestone_type: 'UW Internal',
        is_completed: false,
        form_link: 'https://waterlooabroad.uwaterloo.ca' },
      { milestone_id: 2, title: 'Host University Application',
        deadline_utc: '2025-04-15T23:59:00',
        milestone_type: 'Host University',
        is_completed: false,
        form_link: null },
    ]]);

    const res = await request(app).get('/api/users/testuser/milestones/export');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/calendar/);
    expect(res.headers['content-disposition']).toMatch(/exchange-deadlines\.ics/);
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('BEGIN:VEVENT');
    expect(res.text).toContain('Submit Study Plan');
    expect(res.text).toContain('Host University Application');
    expect(res.text).toContain('END:VCALENDAR');
  });

  test('AC#8 — exports empty calendar when no milestones exist', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/users/testuser/milestones/export');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('END:VCALENDAR');
    expect(res.text).not.toContain('BEGIN:VEVENT');
  });
});