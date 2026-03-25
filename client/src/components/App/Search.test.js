/**
 * Search page tests — user search by name + filters.
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Search from './Search';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FirebaseContext } from '../Firebase';

jest.mock('../Firebase/firebase', () => ({
  __esModule: true,
  default: class MockFirebase {
    constructor() {
      this.auth = {};
      this.googleProvider = {};
    }
  },
}));

const theme = createTheme();

const mockFirebase = {
  auth: { currentUser: null },
};

const renderSearch = (props = {}) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <FirebaseContext.Provider value={mockFirebase}>
          <Search {...props} />
        </FirebaseContext.Provider>
      </ThemeProvider>
    </MemoryRouter>
  );

describe('Search', () => {
  const mockSearchResult = [
    {
      username: 'john.doe',
      display_name: 'John Doe',
      bio: 'Exchange student',
      faculty: 'Engineering',
      program: 'Computer Science',
      grad_year: 2026,
      exchange_term: 'Fall 2025',
      uw_verified: false,
      tags: [],
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial render', () => {
    it('renders the page title and search field', () => {
      renderSearch();
      expect(screen.getByRole('heading', { name: /Search Users/i })).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Search by username or display name/i)
      ).toBeInTheDocument();
    });

    it('shows hint when no query or filters are active', () => {
      renderSearch();
      expect(
        screen.getByText(/Type a name or username, or use the filters above/i)
      ).toBeInTheDocument();
    });

    it('renders filter controls', () => {
      renderSearch();
      expect(screen.getByText(/Filter by profile & tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Faculty$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Program$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Class \(grad year\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Exchange term$/i)).toBeInTheDocument();
    });

    it('does not call the user search API until there is a query or a filter', async () => {
      renderSearch();
      await new Promise((r) => setTimeout(r, 500));
      const searchCalls = (global.fetch.mock.calls || []).filter(
        ([url]) => typeof url === 'string' && url.includes('/api/users/search')
      );
      expect(searchCalls.length).toBe(0);
    });
  });

  describe('search by text', () => {
    it('calls GET /api/users/search with q after the user types (debounced)', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockSearchResult,
      });

      renderSearch();
      const input = screen.getByPlaceholderText(/Search by username or display name/i);
      fireEvent.change(input, { target: { value: 'john' } });

      await waitFor(
        () => {
          const searchCall = global.fetch.mock.calls.find(
            ([url]) =>
              typeof url === 'string' &&
              url.includes('/api/users/search') &&
              /[?&]q=john/.test(url)
          );
          expect(searchCall).toBeDefined();
        },
        { timeout: 5000 }
      );
    });

    it('shows user cards when the API returns matches', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockSearchResult,
      });

      renderSearch();
      fireEvent.change(screen.getByPlaceholderText(/Search by username or display name/i), {
        target: { value: 'jo' },
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/@john\.doe/)).toBeInTheDocument();
      });
    });

    it('shows empty message when API returns no users', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      renderSearch();
      fireEvent.change(screen.getByPlaceholderText(/Search by username or display name/i), {
        target: { value: 'zzz' },
      });

      await waitFor(() => {
        expect(screen.getByText(/No users match your criteria/i)).toBeInTheDocument();
      });
    });
  });

  describe('filters', () => {
    it('calls GET /api/users/search with faculty when a faculty is selected', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockSearchResult,
      });

      renderSearch();
      const facultySelect = screen.getByLabelText(/^Faculty$/i);
      fireEvent.mouseDown(within(facultySelect.parentElement).getByRole('combobox'));
      const listbox = await screen.findByRole('listbox');
      fireEvent.click(within(listbox).getByText('Engineering'));

      await waitFor(
        () => {
          const searchUrl = global.fetch.mock.calls.find(
            ([url]) => typeof url === 'string' && url.includes('/api/users/search')
          );
          expect(searchUrl).toBeDefined();
          expect(searchUrl[0]).toMatch(/[?&]faculty=Engineering/);
        },
        { timeout: 4000 }
      );
    });

    it('calls GET /api/users/search with program when program filter is filled', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockSearchResult,
      });

      renderSearch();
      const programInput = screen.getByLabelText(/^Program$/i);
      fireEvent.change(programInput, { target: { value: 'Computer' } });

      await waitFor(
        () => {
          const searchUrl = global.fetch.mock.calls.find(
            ([url]) => typeof url === 'string' && url.includes('/api/users/search')
          );
          expect(searchUrl).toBeDefined();
          expect(searchUrl[0]).toMatch(/[?&]program=Computer/);
        },
        { timeout: 4000 }
      );
    });
  });
});
