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
    display_name: 'Olga Vecht',
    bio: 'Hello World',
    username: 'olga.vecht'
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

    // Simulate FileReader.onload trigger
    mockFileReader.readAsDataURL.mockImplementation(function () {
      if (this.onload) this.onload();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

    // Verify the photo appears within 2 seconds
    // waitFor has a default timeout of 1000ms, we increase it to 2000ms as per requirement
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
          json: async () => [], // Initial posts
        });

      renderWithTheme(<Profile />);

      // Wait for Profile to load user data (settle initial effects)
      await screen.findByText('olga.vecht');

      // Mock the initial courses fetch that happens when CourseTable mounts
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [], // No initial courses
      });

      // Switch to CourseTable tab (books icon)
      const booksTab = screen.getByLabelText('books');
      fireEvent.click(booksTab);

      // Wait for CourseTable to be visible and its initial fetch to settle
      const submitButton = await screen.findByRole('button', { name: /Submit new course/i });
      fireEvent.click(submitButton);
    });

    it('should display an error alert when required fields have only whitespace', async () => {
      // Fill required fields with whitespace
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

      // Mock subsequent GET for updated list
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
});
