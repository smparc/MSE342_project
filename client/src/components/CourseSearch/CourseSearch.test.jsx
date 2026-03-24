import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CourseSearch from './index';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock Firebase context so authFetch doesn't break tests
jest.mock('../Firebase', () => ({
  FirebaseContext: require('react').createContext(null),
  authFetch: jest.fn((url, options) =>
    fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } })
  ),
}));

describe('CourseSearch Component', () => {
  const mockFilters = { countries: ['Canada'], continents: ['North America'], terms: ['Fall 2023'] };
  const mockCourses = {
    courses: [
      {
        course_id: 1,
        host_course_code: 'CS 101',
        host_course_name: 'Intro to CS',
        uw_course_code: 'CS 135',
        uw_course_name: 'Designing Functional Programs',
        host_university: 'Host Uni',
        country: 'Canada',
        status: 'Approved',
        username: 'testposter',
        display_name: 'Test Poster',
        is_anonymous: 0,
      }
    ],
    pagination: { total: 1, page: 1, totalPages: 1 }
  };

  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/meta/filters')) {
        return Promise.resolve({ json: () => Promise.resolve(mockFilters) });
      }
      if (url.includes('/saved-courses')) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/courses?')) {
        return Promise.resolve({ json: () => Promise.resolve(mockCourses) });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <CourseSearch currentUser="testuser" />
    </BrowserRouter>
  );

  test('renders header and initial elements', async () => {
    renderComponent();
    expect(screen.getByText('Course Equivalency Database')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('CS 101')).toBeInTheDocument();
    });
  });

  test('updates search query on input', async () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/Search by university/i);
    fireEvent.change(searchInput, { target: { value: 'Math' } });
    expect(searchInput.value).toBe('Math');
  });

  test('opens the bookmarks modal', async () => {
    renderComponent();
    const bookmarksBtn = screen.getByText(/My Bookmarks/i);
    fireEvent.click(bookmarksBtn);
    expect(screen.getByText('🔖 My Bookmarks')).toBeInTheDocument();
  });
});

// =============================================================================
// Sprint 2 — Sort Course Equivalencies (Story 5)
// =============================================================================

describe('Sprint 2 — Sort Course Equivalencies (Story 5)', () => {
  const mockFilters = { countries: ['Australia'], continents: ['Oceania'], terms: ['Fall 2023'] };
  const mockCourses = {
    courses: [
      {
        course_id: 1,
        host_course_code: 'MSCI 342', host_course_name: 'Engineering Economics',
        uw_course_code: 'MSCI 342', uw_course_name: 'Engineering Economics',
        host_university: 'University of Melbourne', country: 'Australia',
        status: 'Approved', last_updated: '2024-09-01T00:00:00.000Z', avg_rating: 4.5,
        username: 'alice', display_name: 'Alice Smith', is_anonymous: 0,
      },
      {
        course_id: 2,
        host_course_code: 'CS 301', host_course_name: 'Algorithm Design',
        uw_course_code: 'CS 341', uw_course_name: 'Algorithms',
        host_university: 'University of Edinburgh', country: 'United Kingdom',
        status: 'Approved', last_updated: '2024-01-15T00:00:00.000Z', avg_rating: 3.2,
        username: 'bob', display_name: 'Bob Jones', is_anonymous: 0,
      },
    ],
    pagination: { total: 2, page: 1, totalPages: 1 },
  };

  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/meta/filters'))   return Promise.resolve({ json: () => Promise.resolve(mockFilters) });
      if (url.includes('/saved-courses'))  return Promise.resolve({ json: () => Promise.resolve([]) });
      if (url.includes('/api/courses?'))   return Promise.resolve({ json: () => Promise.resolve(mockCourses) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => { jest.clearAllMocks(); });

  const renderComponent = () => render(
    <BrowserRouter><CourseSearch currentUser="testuser" /></BrowserRouter>
  );

  test('AC#1 — Sort by dropdown is visible', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  test('AC#2 — default sort is Most Recently Updated', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    expect(screen.getByLabelText(/sort by/i).value).toBe('last_updated');
  });

  test('AC#3 — sort options include all three options', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    expect(screen.getByRole('option', { name: /recently updated/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /average rating/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /university name/i })).toBeInTheDocument();
  });

  test('AC#4 — selecting Average Rating sends sort=avg_rating', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    fireEvent.change(screen.getByLabelText(/sort by/i), { target: { value: 'avg_rating' } });
    await waitFor(() => {
      const calls   = global.fetch.mock.calls.filter(c => c[0]?.includes('/api/courses?'));
      const lastUrl = calls[calls.length - 1][0];
      expect(lastUrl).toContain('sort=avg_rating');
    });
  });

  test('AC#5 — selecting University Name sends sort=university', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    fireEvent.change(screen.getByLabelText(/sort by/i), { target: { value: 'university' } });
    await waitFor(() => {
      const calls   = global.fetch.mock.calls.filter(c => c[0]?.includes('/api/courses?'));
      const lastUrl = calls[calls.length - 1][0];
      expect(lastUrl).toContain('sort=university');
    });
  });

  test('AC#6 — sort persists when a country filter is also applied', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    fireEvent.change(screen.getByLabelText(/sort by/i),       { target: { value: 'avg_rating' } });
    fireEvent.change(screen.getByDisplayValue(/All Countries/i), { target: { value: 'Australia' } });
    await waitFor(() => {
      const calls   = global.fetch.mock.calls.filter(c => c[0]?.includes('/api/courses?'));
      const lastUrl = calls[calls.length - 1][0];
      expect(lastUrl).toContain('sort=avg_rating');
      expect(lastUrl).toContain('country=Australia');
    });
  });

  test('AC#7 — default sort=last_updated is in the initial API call', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    const calls = global.fetch.mock.calls.filter(c => c[0]?.includes('/api/courses?'));
    expect(calls[0][0]).toContain('sort=last_updated');
  });
});

// =============================================================================
// Sprint 3 — Bookmark Course Equivalencies (Story 3)
// =============================================================================

describe('Sprint 3 — Bookmark Course Equivalencies (Story 3)', () => {
  const mockCourse = {
    course_id: 1,
    host_course_code: 'CS 101', host_course_name: 'Intro to CS',
    uw_course_code: 'CS 135',  uw_course_name: 'Designing Functional Programs',
    host_university: 'Host Uni', country: 'Canada', status: 'Approved',
    username: 'alice', display_name: 'Alice Smith', is_anonymous: 0,
  };
  const mockCourses = {
    courses: [mockCourse],
    pagination: { total: 1, page: 1, totalPages: 1 },
  };

  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/meta/filters'))  return Promise.resolve({ json: () => Promise.resolve({ countries: [], continents: [], terms: [] }) });
      if (url.includes('/saved-courses')) return Promise.resolve({ json: () => Promise.resolve([]) });
      if (url.includes('/api/courses?'))  return Promise.resolve({ json: () => Promise.resolve(mockCourses) });
      if (url.includes('/api/courses/1')) return Promise.resolve({ json: () => Promise.resolve(mockCourse) });
      return Promise.resolve({ json: () => Promise.resolve({ saved: true }) });
    });
  });

  afterEach(() => { jest.clearAllMocks(); });

  const renderComponent = (user = 'testuser') => render(
    <BrowserRouter><CourseSearch currentUser={user} /></BrowserRouter>
  );

  test('AC1 — bookmark button is visible on each course card', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    const bookmarkBtn = screen.getByTitle(/Bookmark this course/i);
    expect(bookmarkBtn).toBeInTheDocument();
    expect(bookmarkBtn.textContent).toBe('☆');
  });

  test('AC2 — bookmarked course shows filled star', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/meta/filters'))  return Promise.resolve({ json: () => Promise.resolve({ countries: [], continents: [], terms: [] }) });
      if (url.includes('/saved-courses')) return Promise.resolve({ json: () => Promise.resolve([mockCourse]) });
      if (url.includes('/api/courses?'))  return Promise.resolve({ json: () => Promise.resolve(mockCourses) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTitle(/Remove bookmark/i)).toBeInTheDocument();
    });
  });

  test('AC3 — My Bookmarks panel shows key course details', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/meta/filters'))  return Promise.resolve({ json: () => Promise.resolve({ countries: [], continents: [], terms: [] }) });
      if (url.includes('/saved-courses')) return Promise.resolve({ json: () => Promise.resolve([mockCourse]) });
      if (url.includes('/api/courses?'))  return Promise.resolve({ json: () => Promise.resolve(mockCourses) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    fireEvent.click(screen.getByText(/My Bookmarks/i));
    expect(screen.getByText(/CS 101/)).toBeInTheDocument();
    expect(screen.getByText(/Host Uni/)).toBeInTheDocument();
  });

  test('AC6 — empty bookmarks shows helpful message', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    fireEvent.click(screen.getByText(/My Bookmarks/i));
    expect(screen.getByText(/No bookmarks yet/i)).toBeInTheDocument();
  });

  test('AC7 — bookmarked courses show filled star when browsing', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/meta/filters'))  return Promise.resolve({ json: () => Promise.resolve({ countries: [], continents: [], terms: [] }) });
      if (url.includes('/saved-courses')) return Promise.resolve({ json: () => Promise.resolve([mockCourse]) });
      if (url.includes('/api/courses?'))  return Promise.resolve({ json: () => Promise.resolve(mockCourses) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() => {
      const savedBtn = screen.getByTitle(/Remove bookmark/i);
      expect(savedBtn).toHaveClass('saved');
    });
  });

  test('AC8 — login prompt shown when non-logged-in user clicks bookmark', async () => {
    renderComponent(''); // no user
    await waitFor(() => screen.getByText('CS 101'));
    fireEvent.click(screen.getByTitle(/Bookmark this course/i));
    expect(screen.getByText(/Sign in to Bookmark/i)).toBeInTheDocument();
  });

  test('AC8 — login prompt has Sign In and Continue Browsing options', async () => {
    renderComponent('');
    await waitFor(() => screen.getByText('CS 101'));
    fireEvent.click(screen.getByTitle(/Bookmark this course/i));
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue Browsing/i })).toBeInTheDocument();
  });
});

// =============================================================================
// Sprint 3 — View Poster's Name (Story 4)
// =============================================================================

describe('Sprint 3 — View Course Poster Name (Story 4)', () => {
  const baseCourse = {
    course_id: 1,
    host_course_code: 'CS 101', host_course_name: 'Intro to CS',
    uw_course_code: 'CS 135',  uw_course_name: 'Designing Functional Programs',
    host_university: 'Host Uni', country: 'Canada', status: 'Approved',
  };

  const setupWithCourse = (courseOverrides) => {
    const course    = { ...baseCourse, ...courseOverrides };
    const mockCourses = { courses: [course], pagination: { total: 1, page: 1, totalPages: 1 } };
    global.fetch = jest.fn((url) => {
      if (url.includes('/meta/filters'))  return Promise.resolve({ json: () => Promise.resolve({ countries: [], continents: [], terms: [] }) });
      if (url.includes('/saved-courses')) return Promise.resolve({ json: () => Promise.resolve([]) });
      if (url.includes('/api/courses?'))  return Promise.resolve({ json: () => Promise.resolve(mockCourses) });
      if (url.includes('/api/courses/1')) return Promise.resolve({ json: () => Promise.resolve(course) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
  };

  afterEach(() => { jest.clearAllMocks(); });

  const renderComponent = () => render(
    <BrowserRouter><CourseSearch currentUser="testuser" /></BrowserRouter>
  );

  test('AC1 — display_name is shown on the course card', async () => {
    setupWithCourse({ username: 'alice', display_name: 'Alice Smith', is_anonymous: 0 });
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
  });

  test('AC1 — display_name is shown in detail modal', async () => {
    setupWithCourse({ username: 'alice', display_name: 'Alice Smith', is_anonymous: 0 });
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    fireEvent.click(screen.getByText('CS 101').closest('.cs-card'));
    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });
  });

  test('AC2 — author name in modal is a clickable button', async () => {
    setupWithCourse({ username: 'alice', display_name: 'Alice Smith', is_anonymous: 0 });
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    fireEvent.click(screen.getByText('CS 101').closest('.cs-card'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Alice Smith/i })).toBeInTheDocument();
    });
  });

  test('AC4 — anonymous post shows "Anonymous" instead of name', async () => {
    setupWithCourse({ username: 'alice', display_name: 'Alice Smith', is_anonymous: 1 });
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    expect(screen.getByText(/👤 Anonymous/)).toBeInTheDocument();
    expect(screen.queryByText(/Alice Smith/)).not.toBeInTheDocument();
  });

  test('AC4 — anonymous author in modal is not a clickable link', async () => {
    setupWithCourse({ username: 'alice', display_name: 'Alice Smith', is_anonymous: 1 });
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    fireEvent.click(screen.getByText('CS 101').closest('.cs-card'));
    await waitFor(() => screen.getByText('Course Equivalency Details'));
    expect(screen.queryByRole('button', { name: /Anonymous/i })).not.toBeInTheDocument();
  });

  test('AC5 — no username or display_name shows "Legacy Data"', async () => {
    setupWithCourse({ username: null, display_name: null, is_anonymous: 0 });
    renderComponent();
    await waitFor(() => screen.getByText('CS 101'));
    expect(screen.getByText(/👤 Legacy Data/)).toBeInTheDocument();
  });
});