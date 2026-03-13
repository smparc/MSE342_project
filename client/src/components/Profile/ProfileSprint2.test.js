import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Profile from './index';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Profile Sprint 2', () => {
  const mockUser = {
    display_name: 'John Doe',
    bio: 'Hello World',
    username: 'john.doe'
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Photo Deletion', () => {
    it('should remove a photo from the gallery when delete is clicked', async () => {
      const mockPostToDelete = {
        photo_id: 1,
        image_path: 'uploads/test-photo.jpg'
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockPostToDelete],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithTheme(<Profile />);

      const uploadedImage = await screen.findByAltText('Post 1');
      expect(uploadedImage).toBeInTheDocument();

      fireEvent.click(uploadedImage);

      const deleteButton = await screen.findByTestId('DeleteIcon');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByAltText('Post 1')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/Photo deleted successfully/i)).toBeInTheDocument();
    });
  });

  describe('CourseTable Deletion', () => {
    it('should remove a course from the table when delete is clicked', async () => {
      const existingCourse = {
        course_id: 202,
        uw_course_code: 'MATH 115',
        uw_course_name: 'Linear Algebra',
        host_university: 'Oxford',
        host_course_code: 'M1',
        host_course_name: 'Linear Algebra',
        status: 'Approved'
      };

      // Reset and use conditional fetching
      global.fetch.mockReset();
      global.fetch.mockImplementation((url) => {
        if (url.includes('/api/user/')) {
          return Promise.resolve({ ok: true, json: async () => mockUser });
        }
        if (url.includes('/api/posts/')) {
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        if (url.includes('/api/courses/user/')) {
          // First call returns existing course, subsequent call (after delete) returns empty
          if (!global.fetch.hasCalledCourses) {
            global.fetch.hasCalledCourses = true;
            return Promise.resolve({ ok: true, json: async () => [existingCourse] });
          }
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        if (url.includes('/api/courses/202')) {
          // Handle DELETE and maybe other methods if component re-calls something
          return Promise.resolve({ ok: true });
        }
        return Promise.reject(new Error(`Unhandled request: ${url}`));
      });

      renderWithTheme(<Profile />);

      // Switch to CourseTable tab
      const booksTabs = await screen.findAllByLabelText('books');
      fireEvent.click(booksTabs[0]);

      // Wait for course to appear in the table
      const courseCode = await screen.findByText('MATH 115');
      expect(courseCode).toBeInTheDocument();

      // Find delete button and click it
      const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
      fireEvent.click(deleteButton);

      // Verify course is gone
      await waitFor(() => {
        expect(screen.queryByText('MATH 115')).not.toBeInTheDocument();
      });

      // Verify success snackbar
      expect(screen.getByText(/Course changes saved/i)).toBeInTheDocument();
    });
  });

  describe('User Reviews', () => {
    const mockExpenses = {
      monthly_cost: 1500,
      rent_cost: 800,
      meal_cost: 15,
      coffee_cost: 5,
      flight_cost: 1200
    };

    const mockRatings = {
      difficulty_rating: 3,
      safety_rating: 4,
      cleanliness_rating: 5,
      travel_opp_rating: 4,
      food_rating: 4.5,
      scenery_rating: 5,
      activities_rating: 3.5
    };

    let container;

    beforeEach(async () => {
      global.fetch.mockReset();
      global.fetch.mockImplementation((url) => {
        if (url.includes('/api/user/')) {
          return Promise.resolve({ ok: true, json: async () => mockUser });
        }
        if (url.includes('/api/posts/')) {
          return Promise.resolve({ ok: true, json: async () => [] });
        }
        if (url.includes('/expenses')) {
          return Promise.resolve({ ok: true, json: async () => mockExpenses });
        }
        if (url.includes('/ratings')) {
          return Promise.resolve({ ok: true, json: async () => mockRatings });
        }
        return Promise.reject(new Error(`Unhandled request: ${url}`));
      });

      const rendered = renderWithTheme(<Profile />);
      container = rendered.container;
      await screen.findByText('john.doe');

      // Switch to UploadReviews tab (star icon)
      const starTab = screen.getByLabelText('star');
      fireEvent.click(starTab);

      // Wait for reviews to load
      await screen.findByText('Expenses');
      await screen.findByText('Ratings');
    });

    it('should successfully update and save expenses', async () => {
      const rentInput = screen.getAllByDisplayValue('800')[0];
      fireEvent.change(rentInput, { target: { value: '950' } });

      // Mock the successful PUT for expenses and ratings
      global.fetch.mockImplementation((url, options) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      // Click "Save Reviews"
      const saveButton = screen.getByRole('button', { name: /Save Reviews/i });
      fireEvent.click(saveButton);

      // Verify success snackbar appears
      await waitFor(() => {
        expect(screen.getByText(/Reviews updated successfully!/i)).toBeInTheDocument();
      });
    });

    it('should successfully update and save ratings', async () => {
      const difficultyRating = container.querySelector('input[name="difficulty"][value="5"]');
      fireEvent.click(difficultyRating);

      // Mock the successful PUT
      global.fetch.mockImplementation((url, options) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      // Click "Save Reviews"
      const saveButton = screen.getByRole('button', { name: /Save Reviews/i });
      fireEvent.click(saveButton);

      // Verify success snackbar appears
      await waitFor(() => {
        expect(screen.getByText(/Reviews updated successfully!/i)).toBeInTheDocument();
      });
    });

    it('should load initial expenses from the API', async () => {
      // Check if values from mockExpenses are displayed
      expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
      expect(screen.getByDisplayValue('800')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
      const coffeeInput = container.querySelector('input[type="number"][value="5"]');
      expect(coffeeInput).toBeInTheDocument();

      expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
    });

    it('should load initial ratings from the API', async () => {
      // Check if ratings from mockRatings are correctly set
      // The difficulty_rating is 3, so the radio button with value="3" should be checked
      const difficultyRating = container.querySelector('input[name="difficulty"][value="3"]');
      expect(difficultyRating).toBeChecked();

      const safetyRating = container.querySelector('input[name="safety"][value="4"]');
      expect(safetyRating).toBeChecked();

      const cleanlinessRating = container.querySelector('input[name="cleanliness"][value="5"]');
      expect(cleanlinessRating).toBeChecked();
    });
  });
});
