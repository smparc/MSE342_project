import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExchangeCalendar from './index';

const now = new Date();

const makeMilestone = (overrides) => ({
  milestone_id:       1,
  title:              'Test Milestone',
  deadline_utc:       new Date(now.getFullYear(), now.getMonth(), 15).toISOString(),
  milestone_type:     'UW Internal',
  phase:              'Research',
  is_completed:       false,
  is_overdue:         false,
  is_approaching_48h: false,
  is_approaching_7d:  false,
  destination_country: null,
  days_remaining:     30,
  ...overrides,
});

const mockMilestones = [
  makeMilestone({ milestone_id: 1, title: 'UW Deadline',        milestone_type: 'UW Internal',     destination_country: null }),
  makeMilestone({ milestone_id: 2, title: 'Host Deadline',      milestone_type: 'Host University',  destination_country: 'Australia' }),
  makeMilestone({ milestone_id: 3, title: 'Germany Milestone',  milestone_type: 'Host University',  destination_country: 'Germany' }),
];

const mockChecklist = [
  { milestone_id: 10, title: 'Research partner universities', milestone_type: 'Checklist', phase: 'Research',          is_completed: false },
  { milestone_id: 11, title: 'Meet with exchange advisor',    milestone_type: 'Checklist', phase: 'Research',          is_completed: false },
  { milestone_id: 12, title: 'Submit WaterlooAbroad application', milestone_type: 'Checklist', phase: 'Nomination',    is_completed: true  },
  { milestone_id: 13, title: 'Apply to host university',      milestone_type: 'Checklist', phase: 'Host Application',  is_completed: false },
];

// Default fetch mock — returns all milestones for calendar, checklist items for Checklist type
const setupFetch = (calendarData = mockMilestones) => {
  global.fetch = jest.fn((url) => {
    if (url.includes('type=Checklist')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockChecklist) });
    }
    if (url.includes('/milestones') && !url.includes('type=')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(calendarData) });
    }
    if (url.includes('/milestones')) {
      // Filtered fetch — return matching subset
      const params = new URL(url, 'http://localhost').searchParams;
      const type   = params.get('type');
      const dest   = params.get('destination');
      let filtered = calendarData;
      if (type) filtered = filtered.filter(m => m.milestone_type === type);
      if (dest) filtered = filtered.filter(m => m.destination_country === dest);
      return Promise.resolve({ ok: true, json: () => Promise.resolve(filtered) });
    }
    if (url.includes('/api/milestones/') && !url.includes('users')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
};

afterEach(() => { jest.clearAllMocks(); });

// =============================================================================
// STORY 1 — Filter Calendar by Program / Destination
// =============================================================================

describe('Story 1 — Filter Calendar by Program / Destination', () => {
  beforeEach(() => setupFetch());

  test('AC1 — program filter dropdown renders with correct options', async () => {
    render(<ExchangeCalendar currentUser="testuser" />);
    await waitFor(() => screen.getByText('UW Deadline'));

    const select = screen.getByLabelText(/filter by program/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /UW Internal/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Host University/i })).toBeInTheDocument();
  });

  test('AC1 — selecting a program filter fetches milestones with type param', async () => {
    render(<ExchangeCalendar currentUser="testuser" />);
    await waitFor(() => screen.getByText('UW Deadline'));

    fireEvent.change(screen.getByLabelText(/filter by program/i), {
      target: { value: 'UW Internal' },
    });

    await waitFor(() => {
      const calls = global.fetch.mock.calls.filter(c => c[0]?.includes('/milestones'));
      const lastUrl = calls[calls.length - 1][0];
      expect(lastUrl).toContain('type=UW+Internal');
    });
  });

  test('AC2 — destination filter input renders', async () => {
    render(<ExchangeCalendar currentUser="testuser" />);
    await waitFor(() => screen.getByText('UW Deadline'));

    expect(screen.getByLabelText(/filter by destination/i)).toBeInTheDocument();
  });

  test('AC2 — typing a destination fetches milestones with destination param', async () => {
    render(<ExchangeCalendar currentUser="testuser" />);
    await waitFor(() => screen.getByText('UW Deadline'));

    fireEvent.change(screen.getByLabelText(/filter by destination/i), {
      target: { value: 'Australia' },
    });

    await waitFor(() => {
      const calls = global.fetch.mock.calls.filter(c => c[0]?.includes('/milestones'));
      const lastUrl = calls[calls.length - 1][0];
      expect(lastUrl).toContain('destination=Australia');
    });
  });

  test('AC3 — both filters applied together pass both params to API', async () => {
    render(<ExchangeCalendar currentUser="testuser" />);
    await waitFor(() => screen.getByText('UW Deadline'));

    fireEvent.change(screen.getByLabelText(/filter by program/i),     { target: { value: 'Host University' } });
    fireEvent.change(screen.getByLabelText(/filter by destination/i), { target: { value: 'Australia' } });

    await waitFor(() => {
      const calls = global.fetch.mock.calls.filter(c => c[0]?.includes('/milestones'));
      const lastUrl = calls[calls.length - 1][0];
      expect(lastUrl).toContain('destination=Australia');
      expect(lastUrl).toContain('type=Host+University');
    });
  });

  test('AC4 — Clear Filters button appears when a filter is active', async () => {
    render(<ExchangeCalendar currentUser="testuser" />);
    await waitFor(() => screen.getByText('UW Deadline'));

    fireEvent.change(screen.getByLabelText(/filter by program/i), { target: { value: 'UW Internal' } });
    await waitFor(() => expect(screen.getByText(/Clear Filters/i)).toBeInTheDocument());
  });

  test('AC4 — clicking Clear Filters resets both filters', async () => {
    render(<ExchangeCalendar currentUser="testuser" />);
    await waitFor(() => screen.getByText('UW Deadline'));

    fireEvent.change(screen.getByLabelText(/filter by program/i), { target: { value: 'UW Internal' } });
    await waitFor(() => screen.getByText(/Clear Filters/i));
    fireEvent.click(screen.getByText(/Clear Filters/i));

    expect(screen.getByLabelText(/filter by program/i).value).toBe('');
    expect(screen.getByLabelText(/filter by destination/i).value).toBe('');
  });

  test('AC5 — shows "No relevant deadlines found" when filters match nothing', async () => {
    setupFetch([]); // empty result
    render(<ExchangeCalendar currentUser="testuser" />);

    fireEvent.change(screen.getByLabelText(/filter by destination/i), {
      target: { value: 'Antarctica' },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/No relevant deadlines found for these filters/i)
      ).toBeInTheDocument();
    });
  });

  test('AC5 — empty state message is NOT shown when no filters are active', async () => {
    setupFetch([]);
    render(<ExchangeCalendar currentUser="testuser" />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(
      screen.queryByText(/No relevant deadlines found for these filters/i)
    ).not.toBeInTheDocument();
  });
});

// =============================================================================
// STORY 2 — Application Checklist
// =============================================================================

describe('Story 2 — Application Checklist', () => {
  beforeEach(() => setupFetch());

  const openChecklist = async () => {
    render(<ExchangeCalendar currentUser="testuser" />);
    fireEvent.click(screen.getByText(/Application Checklist/i));
    await waitFor(() => screen.getByText('Research partner universities'));
  };

  test('AC1 — checklist tab renders with all required steps', async () => {
    await openChecklist();
    expect(screen.getByText('Research partner universities')).toBeInTheDocument();
    expect(screen.getByText('Meet with exchange advisor')).toBeInTheDocument();
    expect(screen.getByText('Apply to host university')).toBeInTheDocument();
  });

  test('AC1 — checklist items are grouped by phase', async () => {
    await openChecklist();
    expect(screen.getByText('Research')).toBeInTheDocument();
    expect(screen.getByText('Nomination')).toBeInTheDocument();
    expect(screen.getByText('Host Application')).toBeInTheDocument();
  });

  test('AC2 — clicking a checkbox calls PATCH API to mark complete', async () => {
    await openChecklist();

    const uncheckedItem = screen.getByLabelText(/Check: Research partner universities/i);
    fireEvent.click(uncheckedItem);

    await waitFor(() => {
      const patchCall = global.fetch.mock.calls.find(
        c => c[0]?.includes('/api/milestones/') && c[1]?.method === 'PATCH'
      );
      expect(patchCall).toBeDefined();
      expect(JSON.parse(patchCall[1].body).is_completed).toBe(true);
    });
  });

  test('AC3 — progress bar is visible', async () => {
    await openChecklist();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('AC3 — progress percentage reflects completed items', async () => {
    await openChecklist();
    // mockChecklist has 1 of 4 completed = 25%
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('1/4 steps complete')).toBeInTheDocument();
  });

  test('AC3 — progress updates optimistically when item is toggled', async () => {
    await openChecklist();
    // Start: 1/4 = 25%
    expect(screen.getByText('25%')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Check: Research partner universities/i));
    // After toggle: 2/4 = 50%
    await waitFor(() => expect(screen.getByText('50%')).toBeInTheDocument());
  });

  test('AC4 — completed item can be unchecked', async () => {
    await openChecklist();
    // 'Submit WaterlooAbroad application' is pre-completed in mockChecklist
    const checkedItem = screen.getByLabelText(/Uncheck: Submit WaterlooAbroad application/i);
    fireEvent.click(checkedItem);

    await waitFor(() => {
      const patchCall = global.fetch.mock.calls.find(
        c => c[1]?.method === 'PATCH' && JSON.parse(c[1].body).is_completed === false
      );
      expect(patchCall).toBeDefined();
    });
  });

  test('AC5 — completion is saved to API (persists after logout)', async () => {
    await openChecklist();
    fireEvent.click(screen.getByLabelText(/Check: Research partner universities/i));

    await waitFor(() => {
      const patchCalls = global.fetch.mock.calls.filter(c => c[1]?.method === 'PATCH');
      expect(patchCalls.length).toBeGreaterThan(0);
    });
  });
});