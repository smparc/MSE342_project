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
        status: 'Approved'
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
    
    // Wait for courses to load
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

  test('opens the shortlist modal', async () => {
    renderComponent();
    const shortlistBtn = screen.getByText(/My Shortlist/i);
    
    fireEvent.click(shortlistBtn);
    expect(screen.getByText('⭐ My Shortlist')).toBeInTheDocument();
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
      },
      {
        course_id: 2,
        host_course_code: 'CS 301', host_course_name: 'Algorithm Design',
        uw_course_code: 'CS 341', uw_course_name: 'Algorithms',
        host_university: 'University of Edinburgh', country: 'United Kingdom',
        status: 'Approved', last_updated: '2024-01-15T00:00:00.000Z', avg_rating: 3.2,
      },
    ],
    pagination: { total: 2, page: 1, totalPages: 1 },
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

  afterEach(() => { jest.clearAllMocks(); });

  const renderComponent = () => render(
    <BrowserRouter>
      <CourseSearch currentUser="testuser" />
    </BrowserRouter>
  );

  test('AC#1 — Sort by dropdown is visible', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  test('AC#2 — default sort is Most Recently Updated', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    const sortSelect = screen.getByLabelText(/sort by/i);
    expect(sortSelect.value).toBe('last_updated');
  });

  test('AC#3 — sort options include Most Recently Updated, Average Rating, University Name', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));
    expect(screen.getByRole('option', { name: /recently updated/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /average rating/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /university name/i })).toBeInTheDocument();
  });

  test('AC#4 — selecting Average Rating sends sort=avg_rating in the API call', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));

    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: 'avg_rating' } });

    await waitFor(() => {
      const courseCalls = global.fetch.mock.calls.filter(c => c[0]?.includes('/api/courses?'));
      const lastUrl = courseCalls[courseCalls.length - 1][0];
      expect(lastUrl).toContain('sort=avg_rating');
    });
  });

  test('AC#5 — selecting University Name sends sort=university in the API call', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));

    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: 'university' } });

    await waitFor(() => {
      const courseCalls = global.fetch.mock.calls.filter(c => c[0]?.includes('/api/courses?'));
      const lastUrl = courseCalls[courseCalls.length - 1][0];
      expect(lastUrl).toContain('sort=university');
    });
  });

  test('AC#6 — sort persists when a country filter is also applied', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));

    // Set sort to avg_rating first
    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: 'avg_rating' } });

    // Then change the country filter
    const countrySelect = screen.getByDisplayValue(/All Countries/i);
    fireEvent.change(countrySelect, { target: { value: 'Australia' } });

    await waitFor(() => {
      const courseCalls = global.fetch.mock.calls.filter(c => c[0]?.includes('/api/courses?'));
      const lastUrl = courseCalls[courseCalls.length - 1][0];
      expect(lastUrl).toContain('sort=avg_rating');
      expect(lastUrl).toContain('country=Australia');
    });
  });

  test('AC#7 — default sort=last_updated is included in the initial API call', async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/University of Melbourne/));

    const courseCalls = global.fetch.mock.calls.filter(c => c[0]?.includes('/api/courses?'));
    expect(courseCalls.length).toBeGreaterThan(0);
    expect(courseCalls[0][0]).toContain('sort=last_updated');
  });
});