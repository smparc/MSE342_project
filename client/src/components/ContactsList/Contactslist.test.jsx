import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactsList from './index';

jest.mock('./ContactsList.css', () => ({}), { virtual: true });
global.fetch = jest.fn();

const mockContacts = [
  { contact_id: 1, name: 'Dr. Sarah Thompson', role: 'Study Abroad Coordinator',
    email: 'sarah.thompson@uwaterloo.ca', phone: '519-888-4567 x12345',
    faculty: null, department: 'Waterloo International' },
  { contact_id: 2, name: 'Michael Chen', role: 'Exchange Program Advisor',
    email: 'michael.chen@uwaterloo.ca', phone: '519-888-4567 x12346',
    faculty: null, department: 'Waterloo International' },
  { contact_id: 3, name: 'Lisa Park', role: 'Engineering Exchange Advisor',
    email: 'lisa.park@uwaterloo.ca', phone: '519-888-4567 x22101',
    faculty: 'Engineering', department: 'Engineering Undergraduate Office' },
];

beforeEach(() => {
  fetch.mockReset();
  fetch.mockResolvedValueOnce({ ok: true, json: async () => mockContacts });
});

// =============================================================================
// STORY 3 — Study Abroad Contacts List
// =============================================================================

describe('Story 3 — Study Abroad Contacts List', () => {
  test('AC#1 — renders the contacts page with a heading', async () => {
    render(<ContactsList />);
    await waitFor(() => {
      expect(screen.getByText(/Study Abroad Contacts/i)).toBeInTheDocument();
    });
  });

  test('AC#2 — displays each contact name', async () => {
    render(<ContactsList />);
    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Thompson')).toBeInTheDocument();
      expect(screen.getByText('Michael Chen')).toBeInTheDocument();
      expect(screen.getByText('Lisa Park')).toBeInTheDocument();
    });
  });

  test('AC#3 — displays email address for each contact', async () => {
    render(<ContactsList />);
    await waitFor(() => {
      expect(screen.getByText('sarah.thompson@uwaterloo.ca')).toBeInTheDocument();
      expect(screen.getByText('michael.chen@uwaterloo.ca')).toBeInTheDocument();
    });
  });

  test('AC#4 — email links are clickable mailto links', async () => {
    render(<ContactsList />);
    await waitFor(() => {
      const emailLink = screen.getByRole('link', { name: /sarah.thompson/i });
      expect(emailLink.href).toContain('mailto:');
    });
  });

  test('AC#5 — displays role/title for each contact', async () => {
    render(<ContactsList />);
    await waitFor(() => {
      expect(screen.getByText(/Study Abroad Coordinator/i)).toBeInTheDocument();
      expect(screen.getByText(/Exchange Program Advisor/i)).toBeInTheDocument();
    });
  });

  test('AC#6 — displays department for each contact', async () => {
    render(<ContactsList />);
    await waitFor(() => {
      // Two contacts share this department — verify at least one is present
      expect(screen.getAllByText(/Waterloo International/i).length).toBeGreaterThan(0);
    });
  });

  test('AC#7 — faculty-specific contacts show their faculty label', async () => {
    render(<ContactsList />);
    await waitFor(() => {
      // Use selector to target only the faculty badge, not the role/department text
      expect(screen.getByText('Engineering', { selector: '.cl-faculty-badge' })).toBeInTheDocument();
    });
  });

  test('AC#8 — search bar filters contacts by name', async () => {
    render(<ContactsList />);
    await waitFor(() => screen.getByText('Dr. Sarah Thompson'));

    const searchInput = screen.getByPlaceholderText(/search contacts/i);
    await userEvent.type(searchInput, 'Lisa');

    await waitFor(() => {
      expect(screen.getByText('Lisa Park')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Thompson')).not.toBeInTheDocument();
    });
  });

  test('AC#9 — search filters by department', async () => {
    render(<ContactsList />);
    await waitFor(() => screen.getByText('Dr. Sarah Thompson'));

    const searchInput = screen.getByPlaceholderText(/search contacts/i);
    await userEvent.type(searchInput, 'Engineering');

    await waitFor(() => {
      expect(screen.getByText('Lisa Park')).toBeInTheDocument();
      expect(screen.queryByText('Michael Chen')).not.toBeInTheDocument();
    });
  });

  test('AC#10 — shows "No contacts found" when search has no matches', async () => {
    render(<ContactsList />);
    await waitFor(() => screen.getByText('Dr. Sarah Thompson'));

    const searchInput = screen.getByPlaceholderText(/search contacts/i);
    await userEvent.type(searchInput, 'xyznonexistent');

    await waitFor(() => {
      expect(screen.getByText(/No contacts found/i)).toBeInTheDocument();
    });
  });

  test('displays phone number for each contact', async () => {
    render(<ContactsList />);
    await waitFor(() => {
      expect(screen.getByText(/519-888-4567 x12345/)).toBeInTheDocument();
    });
  });
});