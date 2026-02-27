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