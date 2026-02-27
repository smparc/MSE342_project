import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseSearch from '../../components/CourseSearch';

// ─── Mock fetch globally ──────────────────────────────────────────────────────
global.fetch = jest.fn();

const mockCourse = {
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
  last_updated: '2024-09-01T00:00:00.000Z',
  proof_url: 'https://example.com/proof.pdf',
  display_name: 'Test User',
};

const mockPagination = { total: 1, page: 1, limit: 15, totalPages: 1 };

const mockFilterMeta = {
  countries: ['Australia', 'Germany'],
  continents: ['Oceania', 'Europe'],
  terms: ['Fall 2023', 'Winter 2024'],
  universities: ['University of Melbourne'],
};

// Helper: make fetch return a successful courses response
const mockCoursesResponse = (courses = [mockCourse], pagination = mockPagination) => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ courses, pagination }),
  });
};

// Helper: make fetch return filter metadata
const mockFiltersResponse = () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockFilterMeta,
  });
};

beforeEach(() => {
  fetch.mockReset();
  // First fetch call on mount is always filters, second is courses
  mockFiltersResponse();
  mockCoursesResponse();
});

// =============================================================================
// RENDER & BASIC DISPLAY
// =============================================================================

describe('CourseSearch — rendering', () => {
  test('renders search bar and filter dropdowns', async () => {
    render(<CourseSearch currentUser="testuser" />);

    expect(screen.getByPlaceholderText(/search by university/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/All Continents/i)).toBeInTheDocument();
      expect(screen.getByText(/All Countries/i)).toBeInTheDocument();
    });
  });

  test('AC#7 — shows key course info on each card', async () => {
    render(<CourseSearch currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText('MSCI 342')).toBeInTheDocument();
      expect(screen.getByText('BUS 201')).toBeInTheDocument();
      expect(screen.getByText(/University of Melbourne/i)).toBeInTheDocument();
      expect(screen.getByText(/Australia/i)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// SEARCH BEHAVIOUR
// =============================================================================

describe('CourseSearch — search', () => {
  test('AC#1 — typing in search bar triggers a new fetch', async () => {
    render(<CourseSearch currentUser="testuser" />);
    fetch.mockReset();
    mockCoursesResponse();

    const input = screen.getByPlaceholderText(/search by university/i);
    await userEvent.type(input, 'Melbourne');

    await waitFor(() => {
      const calls = fetch.mock.calls.filter(c => c[0].includes('/api/courses'));
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[calls.length - 1][0]).toContain('Melbourne');
    });
  });

  test('AC#4 — shows "No courses found" when results are empty', async () => {
    fetch.mockReset();
    mockFiltersResponse();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [], pagination: { total: 0, page: 1, totalPages: 1 } }),
    });

    render(<CourseSearch currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/No courses found/i)).toBeInTheDocument();
    });
  });

  test('AC#5 — clears search query when X button is clicked', async () => {
    render(<CourseSearch currentUser="testuser" />);
    fetch.mockReset();
    mockCoursesResponse();

    const input = screen.getByPlaceholderText(/search by university/i);
    await userEvent.type(input, 'Melb');

    const clearBtn = await screen.findByText('✕');
    await userEvent.click(clearBtn);

    expect(input.value).toBe('');
  });
});

// =============================================================================
// FILTERS
// =============================================================================

describe('CourseSearch — filters', () => {
  test('AC#3 — selecting country filter updates the displayed results', async () => {
    render(<CourseSearch currentUser="testuser" />);

    await waitFor(() => screen.getByText(/All Countries/i));

    fetch.mockReset();
    mockCoursesResponse([{ ...mockCourse, country: 'Germany' }]);

    const countrySelect = screen.getByDisplayValue('All Countries');
    fireEvent.change(countrySelect, { target: { value: 'Australia' } });

    await waitFor(() => {
      const calls = fetch.mock.calls.filter(c => c[0].includes('/api/courses'));
      expect(calls[calls.length - 1][0]).toContain('country=Australia');
    });
  });

  test('AC#5 clear — "Clear all filters" button resets all filters', async () => {
    render(<CourseSearch currentUser="testuser" />);

    await waitFor(() => screen.getByText(/All Countries/i));

    const countrySelect = screen.getByDisplayValue('All Countries');
    fireEvent.change(countrySelect, { target: { value: 'Australia' } });

    fetch.mockReset();
    mockCoursesResponse();

    const clearBtn = await screen.findByText(/Clear all filters/i);
    await userEvent.click(clearBtn);

    expect(screen.queryByText(/Clear all filters/i)).not.toBeInTheDocument();
  });
});

// =============================================================================
// COURSE DETAIL MODAL
// =============================================================================

describe('CourseSearch — detail modal', () => {
  test('AC#2 — clicking a course card shows UW credit code', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourse,
    });

    render(<CourseSearch currentUser="testuser" />);

    await waitFor(() => screen.getByText('MSCI 342'));

    const card = screen.getAllByText('MSCI 342')[0].closest('.cs-card');
    await userEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText(/Course Equivalency Details/i)).toBeInTheDocument();
    });
  });

  test('AC#9 — modal shows Last Updated date', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourse,
    });

    render(<CourseSearch currentUser="testuser" />);
    await waitFor(() => screen.getByText('MSCI 342'));

    const card = screen.getAllByText('MSCI 342')[0].closest('.cs-card');
    await userEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
    });
  });

  test('modal closes when overlay is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourse,
    });

    render(<CourseSearch currentUser="testuser" />);
    await waitFor(() => screen.getByText('MSCI 342'));

    const card = screen.getAllByText('MSCI 342')[0].closest('.cs-card');
    await userEvent.click(card);

    await waitFor(() => screen.getByText(/Course Equivalency Details/i));

    const overlay = document.querySelector('.cs-modal-overlay');
    await userEvent.click(overlay);

    await waitFor(() => {
      expect(screen.queryByText(/Course Equivalency Details/i)).not.toBeInTheDocument();
    });
  });
});

// =============================================================================
// SHORTLIST / SAVED COURSES
// =============================================================================

describe('CourseSearch — shortlist (AC#10)', () => {
  test('clicking save icon calls saved-courses API', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ saved: true, message: 'Added to shortlist' }),
    });

    render(<CourseSearch currentUser="testuser" />);
    await waitFor(() => screen.getByText('MSCI 342'));

    const saveBtn = document.querySelector('.cs-save-btn');
    await userEvent.click(saveBtn);

    await waitFor(() => {
      const saveCalls = fetch.mock.calls.filter(c =>
        c[0].includes('saved-courses')
      );
      expect(saveCalls.length).toBeGreaterThan(0);
    });
  });

  test('shortlist panel opens when My Shortlist button is clicked', async () => {
    render(<CourseSearch currentUser="testuser" />);

    await waitFor(() => screen.getByText(/My Shortlist/i));
    await userEvent.click(screen.getByText(/My Shortlist/i));

    expect(screen.getByText(/⭐ My Shortlist/i)).toBeInTheDocument();
  });
});

// =============================================================================
// PAGINATION
// =============================================================================

describe('CourseSearch — pagination (AC#6)', () => {
  test('shows pagination controls when multiple pages exist', async () => {
    fetch.mockReset();
    mockFiltersResponse();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        courses: [mockCourse],
        pagination: { total: 50, page: 1, limit: 15, totalPages: 4 },
      }),
    });

    render(<CourseSearch currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 4/i)).toBeInTheDocument();
      expect(screen.getByText(/Next →/i)).toBeInTheDocument();
    });
  });

  test('Prev button is disabled on first page', async () => {
    fetch.mockReset();
    mockFiltersResponse();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        courses: [mockCourse],
        pagination: { total: 50, page: 1, limit: 15, totalPages: 4 },
      }),
    });

    render(<CourseSearch currentUser="testuser" />);

    await waitFor(() => {
      const prevBtn = screen.getByText(/← Prev/i);
      expect(prevBtn).toBeDisabled();
    });
  });
});