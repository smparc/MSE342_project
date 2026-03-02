/**
 * Search component unit tests (outside-in TDD style).
 * These tests describe the expected behavior of the Search feature
 * as if written before implementation.
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Search from './Search';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Search', () => {
  const mockUser = {
    username: 'john.doe',
    display_name: 'John Doe',
    email: 'john@example.com',
    bio: 'Exchange student',
    faculty: 'Engineering',
    program: 'Computer Science',
    grad_year: 2026,
    exchange_term: 'Fall 2025',
  };

  const mockPosts = [
    { photo_id: 1, username: 'john.doe', image_path: 'uploads/img1.jpg', caption: 'Paris trip', location: 'Paris, France', uploaded_at: '2025-01-15T10:00:00Z' },
    { photo_id: 2, username: 'john.doe', image_path: 'uploads/img2.jpg', caption: null, location: null, uploaded_at: '2025-01-14T09:00:00Z' },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial render', () => {
    it('renders the Search heading', () => {
      renderWithTheme(<Search />);
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('renders the search input field', () => {
      renderWithTheme(<Search />);
      expect(screen.getByPlaceholderText(/Search by username/i)).toBeInTheDocument();
    });

    it('renders the Search button', () => {
      renderWithTheme(<Search />);
      expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    });

  });

  describe('performing a search', () => {
    it('calls user and posts APIs when Search button is clicked', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockUser })
        .mockResolvedValueOnce({ ok: true, json: async () => mockPosts });

      renderWithTheme(<Search />);

      const input = screen.getByPlaceholderText(/Search by username/i);
      fireEvent.change(input, { target: { value: 'john.doe' } });
      fireEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/user\/john\.doe/)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/posts\/john\.doe/)
        );
      });
    });

  });

});