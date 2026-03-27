/**
 * Search page tests — user search by name + filters.
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

function mockFetchForSearch(searchJson) {
  return jest.fn((url) => {
    const s = typeof url === 'string' ? url : '';
    if (s.includes('/api/users/search')) {
      return Promise.resolve({
        ok: true,
        json: async () => searchJson,
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => [],
    });
  });
}

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
    global.fetch = mockFetchForSearch([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial render', () => {
    it('renders the page title and search field', () => {
      renderSearch();
      expect(screen.getByRole('heading', { name: /Search Users/i })).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Search by name, username, program, exchange country, or exchange university/i)
      ).toBeInTheDocument();
    });

    it('calls GET /api/users/search on load to list users (no q required)', async () => {
      renderSearch();
      await waitFor(
        () => {
          const call = global.fetch.mock.calls.find(
            ([url]) => typeof url === 'string' && url.includes('/api/users/search')
          );
          expect(call).toBeDefined();
          expect(call[0]).toMatch(/includeTags=1/);
          expect(call[0]).not.toMatch(/[?&]q=/);
        },
        { timeout: 4000 }
      );
    });

    it('renders filter controls (faculty, class, exchange term)', () => {
      renderSearch();
      expect(screen.getByLabelText(/^Faculty$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Class \(graduation year\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Exchange term$/i)).toBeInTheDocument();
    });
  });

  describe('search by text', () => {
    it('calls GET /api/users/search with q after the user types (debounced)', async () => {
      global.fetch = mockFetchForSearch(mockSearchResult);

      renderSearch();
      const input = screen.getByPlaceholderText(
        /Search by name, username, program, exchange country, or exchange university/i
      );
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
      global.fetch = mockFetchForSearch(mockSearchResult);

      renderSearch();
      fireEvent.change(
        screen.getByPlaceholderText(/Search by name, username, program, exchange country, or exchange university/i),
        {
          target: { value: 'jo' },
        }
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/@john\.doe/)).toBeInTheDocument();
      });
    });

    it('shows empty message when API returns no users', async () => {
      global.fetch = mockFetchForSearch([]);

      renderSearch();

      await waitFor(() => {
        expect(screen.getByText(/No users match your criteria/i)).toBeInTheDocument();
      });
    });

    it('sends typed program text as q (server matches username, name, program, and exchange fields)', async () => {
      global.fetch = mockFetchForSearch(mockSearchResult);

      renderSearch();
      fireEvent.change(
        screen.getByPlaceholderText(/Search by name, username, program, exchange country, or exchange university/i),
        {
          target: { value: 'Biology' },
        }
      );

      await waitFor(
        () => {
          const withQ = global.fetch.mock.calls.filter(
            ([url]) => typeof url === 'string' && /[?&]q=/.test(url)
          );
          expect(withQ.length).toBeGreaterThan(0);
          const lastUrl = withQ[withQ.length - 1][0];
          const u = new URL(lastUrl, 'http://localhost');
          expect(u.searchParams.get('q')).toBe('Biology');
        },
        { timeout: 6000 }
      );
    });
  });

  describe('filters', () => {
    it('calls GET /api/users/search with faculty when a faculty is selected', async () => {
      global.fetch = mockFetchForSearch(mockSearchResult);

      renderSearch();
      fireEvent.change(screen.getByLabelText(/^Faculty$/i), {
        target: { value: 'Engineering' },
      });

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

    it('calls GET /api/users/search with grad_year when class is selected', async () => {
      global.fetch = mockFetchForSearch(mockSearchResult);

      renderSearch();
      fireEvent.change(screen.getByLabelText(/Class \(graduation year\)/i), {
        target: { value: '2026' },
      });

      await waitFor(
        () => {
          const searchUrl = global.fetch.mock.calls.find(
            ([url]) => typeof url === 'string' && url.includes('/api/users/search')
          );
          expect(searchUrl).toBeDefined();
          expect(searchUrl[0]).toMatch(/[?&]grad_year=2026/);
        },
        { timeout: 4000 }
      );
    });

    it('calls GET /api/users/search with exchange_term when exchange term is selected', async () => {
      global.fetch = mockFetchForSearch(mockSearchResult);

      renderSearch();
      fireEvent.change(screen.getByLabelText(/^Exchange term$/i), {
        target: { value: '3A' },
      });

      await waitFor(
        () => {
          const urls = global.fetch.mock.calls
            .map(([u]) => u)
            .filter((u) => typeof u === 'string' && u.includes('/api/users/search'));
          expect(urls.length).toBeGreaterThan(0);
          const lastUrl = urls[urls.length - 1];
          const u = new URL(lastUrl, 'http://localhost');
          expect(u.searchParams.get('exchange_term')).toBe('3A');
        },
        { timeout: 4000 }
      );
    });
  });
});
