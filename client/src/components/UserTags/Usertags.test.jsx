import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserTags from './index';

const mockTags = [
  { tag_id: 1, username: 'otheruser', tag_type: 'program',  tag_value: 'Software Engineering' },
  { tag_id: 2, username: 'otheruser', tag_type: 'year',     tag_value: '3B' },
  { tag_id: 3, username: 'otheruser', tag_type: 'country',  tag_value: 'Australia' },
  { tag_id: 4, username: 'otheruser', tag_type: 'school',   tag_value: 'University of Melbourne' },
  { tag_id: 5, username: 'otheruser', tag_type: 'term',     tag_value: 'Fall 2024' },
];

describe('UserTags Component (Story 9)', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockTags) })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('AC#1 — fetches tags for the given username', async () => {
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/otheruser/tags')
      );
    });
  });

  test('AC#2 — displays program tag value', async () => {
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(screen.getByText('Software Engineering')).toBeInTheDocument();
    });
  });

  test('AC#3 — displays year tag value', async () => {
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(screen.getByText('3B')).toBeInTheDocument();
    });
  });

  test('AC#4 — displays destination country tag value', async () => {
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(screen.getByText('Australia')).toBeInTheDocument();
    });
  });

  test('AC#5 — displays destination school tag value', async () => {
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(screen.getByText('University of Melbourne')).toBeInTheDocument();
    });
  });

  test('AC#6 — tag type labels are shown (Program, Year, Destination, Host School)', async () => {
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(screen.getByText('Program')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('Destination')).toBeInTheDocument();
      expect(screen.getByText('Host School')).toBeInTheDocument();
    });
  });

  test('AC#7 — shows empty state when user has no tags', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(screen.getByText(/no tags yet/i)).toBeInTheDocument();
    });
  });

  test('AC#8 — handles API error gracefully without crashing', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 404 })
    );
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(screen.queryByText('Software Engineering')).not.toBeInTheDocument();
    });
  });

  test('renders term tag value', async () => {
    render(<UserTags username="otheruser" />);
    await waitFor(() => {
      expect(screen.getByText('Fall 2024')).toBeInTheDocument();
    });
  });
});