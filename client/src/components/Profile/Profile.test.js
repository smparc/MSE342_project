import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Profile from './index';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Profile Photo Upload', () => {
  const mockUser = {
    display_name: 'John Doe',
    bio: 'Hello World',
    username: 'john.doe'
  };

  const mockPost = {
    photo_id: 1,
    image_path: 'uploads/test-photo.jpg'
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    // Mocking FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mock'
    };
    global.FileReader = jest.fn(() => mockFileReader);

    mockFileReader.readAsDataURL.mockImplementation(function () {
      if (this.onload) this.onload();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Performance acceptance criteria
  it('should display the uploaded photo within 2 seconds after upload', async () => {
    // 1. Mock initial data fetch (user and empty posts)
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // Initial empty posts
      })
      // 2. Mock upload response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filePath: 'uploads/test-photo.jpg' }),
      })
      // 3. Mock re-fetch posts after upload
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPost],
      });

    const { container } = renderWithTheme(<Profile />);

    // Verify we are in the "Photos" section by checking for the "Share Photos" text
    await waitFor(() => {
      expect(screen.getAllByText(/Share Photos/i)[0]).toBeInTheDocument();
    });

    // Find the file input
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['dummy image content'], 'test-photo.jpg', { type: 'image/jpeg' });

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Verify the photo appears within 2 seconds (performace)
    // waitFor has a default timeout of 1000ms, we increase it to 2000ms
    await waitFor(() => {
      const uploadedImage = screen.getByAltText('Post 1');
      expect(uploadedImage).toBeInTheDocument();
      expect(uploadedImage).toHaveAttribute('src', '/uploads/test-photo.jpg');
    }, { timeout: 2000 });

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
  });

  it('should display a confirmation message upon successful photo upload', async () => {
    // 1. Mock initial data fetch
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // 2. Mock upload response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filePath: 'uploads/test-photo.jpg' }),
      })
      // 3. Mock re-fetch posts after upload
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPost],
      });

    const { container } = renderWithTheme(<Profile />);

    // Find the file input and simulate selection
    await waitFor(() => expect(container.querySelector('input[type="file"]')).toBeInTheDocument());
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['dummy image content'], 'test-photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Verify confirmation message appears
    await waitFor(() => {
      expect(screen.getByText(/Photo uploaded successfully/i)).toBeInTheDocument();
    });
  });

  it('should display an error alert when saving profile with only whitespace in display name and bio', async () => {
    // 1. Mock initial data fetch (user and empty posts)
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithTheme(<Profile />);

    // Wait for the profile to load and click the "Edit Profile" button
    const editButton = await screen.findByRole('button', { name: /Edit Profile/i });
    fireEvent.click(editButton);

    // Wait for the modal to appear
    const displayNameInput = await screen.findByLabelText(/Display Name/i);
    const bioInput = await screen.findByLabelText(/Bio/i);

    // Enter only whitespace into both fields
    fireEvent.change(displayNameInput, { target: { value: '   ' } });
    fireEvent.change(bioInput, { target: { value: '  \n  ' } });

    // Click "Save Changes"
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    // Verify error alert appears
    await waitFor(() => {
      expect(screen.getByText(/All entries must have a value. Please try again./i)).toBeInTheDocument();
    });
  });


  describe('CourseTable', () => {
    beforeEach(async () => {
      // Mock initial user fetch and initial empty courses fetch
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithTheme(<Profile />);

      // Wait for Profile to load user data (settle initial effects)
      await screen.findByText('john.doe');

      // Mock the initial courses fetch that happens when CourseTable mounts
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Switch to CourseTable tab (books icon)
      const booksTab = screen.getByLabelText('books');
      fireEvent.click(booksTab);

      // Wait for CourseTable to be visible and its initial fetch to settle
      const submitButton = await screen.findByRole('button', { name: /Submit new course/i });
      fireEvent.click(submitButton);
    });

    it('should display an error alert when required fields have only whitespace', async () => {
      // Fill required fields with whitespace (similar to profile display test)
      fireEvent.change(screen.getByLabelText(/UW Course Code/i), { target: { value: '   ' } });
      fireEvent.change(screen.getByLabelText(/UW Course Name/i), { target: { value: '   ' } });
      fireEvent.change(screen.getByLabelText(/Host University/i), { target: { value: '   ' } });
      fireEvent.change(screen.getByLabelText(/Host Course Code/i), { target: { value: '   ' } });
      fireEvent.change(screen.getByLabelText(/Host Course Name/i), { target: { value: '   ' } });

      // Click "Add Course"
      fireEvent.click(screen.getByRole('button', { name: /Add Course/i }));

      // Verify error alert appears
      await waitFor(() => {
        expect(screen.getByText(/Required entries must have a value. Please try again./i)).toBeInTheDocument();
      });
    });

    // Happy test (success)
    it('should add a new row to the table when valid data is submitted', async () => {
      const newCourse = {
        course_id: 101,
        uw_course_code: 'MATH 115',
        uw_course_name: 'Linear Algebra',
        host_university: 'Host Uni',
        host_course_code: 'MATH 101',
        host_course_name: 'Host Linear Algebra',
        status: 'Pending'
      };

      // Fill in valid data
      fireEvent.change(screen.getByLabelText(/UW Course Code/i), { target: { value: 'MATH 115' } });
      fireEvent.change(screen.getByLabelText(/UW Course Name/i), { target: { value: 'Linear Algebra' } });
      fireEvent.change(screen.getByLabelText(/Host University/i), { target: { value: 'Host Uni' } });
      fireEvent.change(screen.getByLabelText(/Host Course Code/i), { target: { value: 'MATH 101' } });
      fireEvent.change(screen.getByLabelText(/Host Course Name/i), { target: { value: 'Host Linear Algebra' } });

      // Mock successful POST
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Mock GET for updated list
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [newCourse],
      });

      // Click "Add Course"
      fireEvent.click(screen.getByRole('button', { name: /Add Course/i }));

      // Verify the new course appears in the table
      await waitFor(() => {
        expect(screen.getByText('MATH 115')).toBeInTheDocument();
        expect(screen.getByText('Linear Algebra')).toBeInTheDocument();
        expect(screen.getByText('Host Uni')).toBeInTheDocument();
      });
    });
  });

  describe('Photo Deletion', () => {
    it('should remove a photo from the gallery when delete is clicked', async () => {
      const mockPostToDelete = {
        photo_id: 1,
        image_path: 'uploads/test-photo.jpg'
      };

      global.fetch = jest.fn()
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

  describe('Editing Tags', () => {
    const updatedTags = {
      faculty: 'Engineering',
      program: 'Software Engineering',
      grad_year: '2026',
      exchange_term: 'Fall 2025'
    };

    it('should successfully update tags and display them in the profile header', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockUser })
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      renderWithTheme(<Profile />);

      const editTagsButton = await screen.findByRole('button', { name: /Add Tags/i });
      fireEvent.click(editTagsButton);

      fireEvent.change(screen.getByLabelText(/Faculty/i), { target: { value: updatedTags.faculty } });
      fireEvent.change(screen.getByLabelText(/Program/i), { target: { value: updatedTags.program } });
      fireEvent.change(screen.getByLabelText(/Graduation Year/i), { target: { value: updatedTags.grad_year } });
      fireEvent.change(screen.getByLabelText(/Exchange Term/i), { target: { value: updatedTags.exchange_term } });

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(updatedTags.faculty)).toBeInTheDocument();
        expect(screen.getByText(updatedTags.program)).toBeInTheDocument();
        expect(screen.getByText(`Class of ${updatedTags.grad_year}`)).toBeInTheDocument();
        expect(screen.getByText(`${updatedTags.exchange_term} Exchange`)).toBeInTheDocument();
      });

      expect(screen.getByText(/Profile changes saved/i)).toBeInTheDocument();
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
      // Find the "Monthly Rent" input. It's inside a TableCell and is an MUI Input.
      // Find it by its value.
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
      // Find the Rating component for "School Difficulty". It has name="difficulty".
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
