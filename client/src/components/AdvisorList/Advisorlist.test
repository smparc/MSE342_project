import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvisorsList from './index';

jest.mock('./AdvisorsList.css', () => ({}), { virtual: true });
global.fetch = jest.fn();

const mockAdvisors = [
  { advisor_id: 1, name: 'Prof. David Kim', email: 'david.kim@uwaterloo.ca',
    office: 'E7 4412', faculty: 'Engineering', programs: 'SE,CE,ECE',
    office_hours: 'Mon/Wed 2–4pm' },
  { advisor_id: 2, name: 'Prof. Aisha Nwosu', email: 'aisha.nwosu@uwaterloo.ca',
    office: 'MC 5304', faculty: 'Math', programs: 'CS,CFM,MATH',
    office_hours: 'Tue/Thu 1–3pm' },
  { advisor_id: 3, name: 'Prof. Rachel Stein', email: 'rachel.stein@uwaterloo.ca',
    office: 'PAS 2082', faculty: 'Arts', programs: 'ECON,PSYCH,SOC',
    office_hours: 'Mon/Fri 10am–12pm' },
];

beforeEach(() => {
  fetch.mockReset();
  fetch.mockResolvedValueOnce({ ok: true, json: async () => mockAdvisors });
});

// =============================================================================
// STORY 4 — Academic Advisors Contact List
// =============================================================================

describe('Story 4 — Academic Advisors List', () => {
  test('AC#1 — renders advisors page with heading', async () => {
    render(<AdvisorsList />);
    await waitFor(() => {
      expect(screen.getByText(/Academic Advisors/i)).toBeInTheDocument();
    });
  });

  test('AC#2 — displays each advisor name', async () => {
    render(<AdvisorsList />);
    await waitFor(() => {
      expect(screen.getByText('Prof. David Kim')).toBeInTheDocument();
      expect(screen.getByText('Prof. Aisha Nwosu')).toBeInTheDocument();
      expect(screen.getByText('Prof. Rachel Stein')).toBeInTheDocument();
    });
  });

  test('AC#3 — displays email for each advisor', async () => {
    render(<AdvisorsList />);
    await waitFor(() => {
      expect(screen.getByText('david.kim@uwaterloo.ca')).toBeInTheDocument();
      expect(screen.getByText('aisha.nwosu@uwaterloo.ca')).toBeInTheDocument();
    });
  });

  test('AC#4 — email links are mailto links', async () => {
    render(<AdvisorsList />);
    await waitFor(() => {
      const emailLink = screen.getByRole('link', { name: /david.kim/i });
      expect(emailLink.href).toContain('mailto:');
    });
  });

  test('AC#5 — displays office location', async () => {
    render(<AdvisorsList />);
    await waitFor(() => {
      expect(screen.getByText(/E7 4412/i)).toBeInTheDocument();
      expect(screen.getByText(/MC 5304/i)).toBeInTheDocument();
    });
  });

  test('AC#6 — displays office hours for each advisor', async () => {
    render(<AdvisorsList />);
    await waitFor(() => {
      expect(screen.getByText(/Mon\/Wed 2–4pm/i)).toBeInTheDocument();
      expect(screen.getByText(/Tue\/Thu 1–3pm/i)).toBeInTheDocument();
    });
  });

  test('AC#7 — displays faculty for each advisor', async () => {
    render(<AdvisorsList />);
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Math')).toBeInTheDocument();
      expect(screen.getByText('Arts')).toBeInTheDocument();
    });
  });

  test('AC#8 — displays programs advised for each advisor', async () => {
    render(<AdvisorsList />);
    await waitFor(() => {
      expect(screen.getByText(/SE/i)).toBeInTheDocument();
      expect(screen.getByText(/CS/i)).toBeInTheDocument();
    });
  });

  test('AC#9 — search bar filters by advisor name', async () => {
    render(<AdvisorsList />);
    await waitFor(() => screen.getByText('Prof. David Kim'));

    const searchInput = screen.getByPlaceholderText(/search advisors/i);
    await userEvent.type(searchInput, 'David');

    await waitFor(() => {
      expect(screen.getByText('Prof. David Kim')).toBeInTheDocument();
      expect(screen.queryByText('Prof. Aisha Nwosu')).not.toBeInTheDocument();
    });
  });

  test('AC#10 — faculty filter dropdown filters results', async () => {
    render(<AdvisorsList />);
    await waitFor(() => screen.getByText('Prof. David Kim'));

    const facultyFilter = screen.getByLabelText(/filter by faculty/i);
    fireEvent.change(facultyFilter, { target: { value: 'Engineering' } });

    await waitFor(() => {
      expect(screen.getByText('Prof. David Kim')).toBeInTheDocument();
      expect(screen.queryByText('Prof. Aisha Nwosu')).not.toBeInTheDocument();
    });
  });

  test('shows "No advisors found" when search has no matches', async () => {
    render(<AdvisorsList />);
    await waitFor(() => screen.getByText('Prof. David Kim'));

    const searchInput = screen.getByPlaceholderText(/search advisors/i);
    await userEvent.type(searchInput, 'xyznonexistent');

    await waitFor(() => {
      expect(screen.getByText(/No advisors found/i)).toBeInTheDocument();
    });
  });
});