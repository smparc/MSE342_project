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
    mockFileReader.readAsDataURL.mockImplementation(function() {
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
});
