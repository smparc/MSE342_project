import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Profile from './index';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Profile Sprint 1', () => {
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

    // wait for the profile to load and click the "Edit Profile" button
    const editButton = await screen.findByRole('button', { name: /Edit Profile/i });
    fireEvent.click(editButton);

    // wait for the modal
    const displayNameInput = await screen.findByLabelText(/Display Name/i);
    // const bioInput = await screen.findByLabelText(/Bio/i);

    // Enter only whitespace into display name field only (bio can now have white space/be empty)
    fireEvent.change(displayNameInput, { target: { value: '   ' } });
    // fireEvent.change(bioInput, { target: { value: '  \n  ' } });

    // save changes
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    // verify error alert appears
    await waitFor(() => {
      // expect(screen.getByText(/All entries must have a value. Please try again./i)).toBeInTheDocument();
      expect(screen.getByText(/Display name must have a value./i)).toBeInTheDocument();
    });
  });


  describe('CourseTable', () => {
    beforeEach(async () => {
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

      await screen.findByText('john.doe');

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

  describe('Editing Tags', () => {
    const updatedTags = {
      faculty: 'Engineering',
      program: 'Software Engineering',
      grad_year: '2026',
      exchange_term: '3B',
      exchange_country: 'Denmark',
      exchange_school: 'DTU'
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

      // fireEvent.change(screen.getByLabelText(/Faculty/i), { target: { value: updatedTags.faculty } });
      // fireEvent.change(screen.getByLabelText(/Program/i), { target: { value: updatedTags.program } });

      const facultySelect = screen.getByLabelText(/Faculty/i)
      fireEvent.mouseDown(facultySelect)
      fireEvent.click(screen.getByText(updatedTags.faculty))

      const programSelect = screen.getByLabelText(/Program/i)
      fireEvent.mouseDown(programSelect)
      fireEvent.click(screen.getByText(updatedTags.program))

      fireEvent.change(screen.getByLabelText(/Graduation Year/i), { target: { value: updatedTags.grad_year } });
      // fireEvent.change(screen.getByLabelText(/Exchange Term/i), { target: { value: updatedTags.exchange_term } });

      const termSelect = screen.getByLabelText(/Exchange Term/i)
      fireEvent.mouseDown(termSelect)
      fireEvent.click(screen.getByText(updatedTags.exchange_term))

      fireEvent.change(screen.getByLabelText(/Exchange Country/i), { target: { value: updatedTags.exchange_country } });
      fireEvent.change(screen.getByLabelText(/Exchange School/i), { target: { value: updatedTags.exchange_school } });


      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(updatedTags.faculty)).toBeInTheDocument()
        expect(screen.getByText(updatedTags.program)).toBeInTheDocument()
        expect(screen.getByText(`Class of ${updatedTags.grad_year}`)).toBeInTheDocument()
        expect(screen.getByText(`${updatedTags.exchange_term} Exchange`)).toBeInTheDocument()
        expect(screen.getByText(updatedTags.exchange_country))
        expect(screen.getByText(updatedTags.exchange_school))
      });

      expect(screen.getByText(/Profile changes saved/i)).toBeInTheDocument();
    });
  });
});
