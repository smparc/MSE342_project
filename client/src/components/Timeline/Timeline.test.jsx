import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Timeline from './index';

describe('Timeline Component', () => {
  const mockMilestones = [
    {
      milestone_id: 1,
      title: 'Submit Application',
      deadline_utc: '2024-12-01T12:00:00Z',
      milestone_type: 'UW Internal',
      is_completed: true,
      is_overdue: false,
    },
    {
      milestone_id: 2,
      title: 'Host Uni Forms',
      deadline_utc: '2024-12-15T12:00:00Z',
      milestone_type: 'Host University',
      is_completed: false,
      is_approaching_7d: true,
    }
  ];

  beforeEach(() => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMilestones)
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders timeline and milestones', async () => {
    render(<Timeline currentUser="testuser" />);
    
    expect(screen.getByText('Exchange Timeline')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Submit Application')).toBeInTheDocument();
      expect(screen.getByText('Host Uni Forms')).toBeInTheDocument();
    });
  });

  test('calculates and displays correct progress percentage', async () => {
    render(<Timeline currentUser="testuser" />);
    
    await waitFor(() => {
      // 1 out of 2 completed = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('1/2 milestones complete')).toBeInTheDocument();
    });
  });

  test('opens add milestone modal and shows validation errors', async () => {
    render(<Timeline currentUser="testuser" />);
    
    // Wait for the initial background fetch to finish so we don't get an act(...) warning
    await waitFor(() => {
      expect(screen.getByText('Submit Application')).toBeInTheDocument();
    });

    const addBtn = screen.getByText('+ Add Milestone');
    fireEvent.click(addBtn);
    
    // Use getByRole to specifically target the heading and avoid the multiple elements error
    expect(screen.getByRole('heading', { name: 'Add Milestone' })).toBeInTheDocument();
    
    // Also use getByRole for the button to make the test click more robust
    const submitBtn = screen.getByRole('button', { name: 'Add Milestone' });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Deadline is required')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// Sprint 2 — Timeline Phase Grouping, Days Remaining, Destination Filter
// =============================================================================

describe('Sprint 2 — Timeline Phases (Story 1)', () => {
  const now = new Date();
  const in5d  = new Date(now.getTime() + 5  * 24 * 60 * 60 * 1000).toISOString();
  const in15d = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();
  const in25d = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString();

  const mockMilestonesWithPhases = [
    {
      milestone_id: 1, title: 'Research Exchange Programs',
      deadline_utc: in5d, milestone_type: 'UW Internal',
      phase: 'Research', is_completed: false,
      prerequisite_id: null, prerequisite_completed: null,
      destination_country: null, days_remaining: 5,
      is_approaching_48h: false, is_approaching_7d: true, is_overdue: false,
    },
    {
      milestone_id: 2, title: 'Submit Nomination Form',
      deadline_utc: in15d, milestone_type: 'UW Internal',
      phase: 'Nomination', is_completed: false,
      prerequisite_id: null, prerequisite_completed: null,
      destination_country: null, days_remaining: 15,
      is_approaching_48h: false, is_approaching_7d: false, is_overdue: false,
    },
    {
      milestone_id: 3, title: 'Apply to Host University',
      deadline_utc: in25d, milestone_type: 'Host University',
      phase: 'Host Application', is_completed: false,
      prerequisite_id: null, prerequisite_completed: null,
      destination_country: 'Australia', days_remaining: 25,
      is_approaching_48h: false, is_approaching_7d: false, is_overdue: false,
    },
    {
      milestone_id: 4, title: 'Submit Housing Application',
      deadline_utc: in25d, milestone_type: 'Host University',
      phase: 'Host Application', is_completed: false,
      prerequisite_id: null, prerequisite_completed: null,
      destination_country: 'Germany', days_remaining: 25,
      is_approaching_48h: false, is_approaching_7d: false, is_overdue: false,
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockMilestonesWithPhases) })
    );
  });

  afterEach(() => { jest.clearAllMocks(); });

  test('AC#1 — Research phase heading is rendered', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => {
      expect(screen.getByText('Research')).toBeInTheDocument();
    });
  });

  test('AC#1 — Nomination phase heading is rendered', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => {
      expect(screen.getByText('Nomination')).toBeInTheDocument();
    });
  });

  test('AC#1 — Host Application phase heading is rendered', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => {
      expect(screen.getByText('Host Application')).toBeInTheDocument();
    });
  });

  test('AC#1 — milestones appear under their correct phase headings', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => {
      expect(screen.getByText('Research Exchange Programs')).toBeInTheDocument();
      expect(screen.getByText('Submit Nomination Form')).toBeInTheDocument();
      expect(screen.getByText('Apply to Host University')).toBeInTheDocument();
    });
  });
});

describe('Sprint 2 — Days Remaining (Story 2)', () => {
  const now = new Date();
  const in5d = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

  const mockWithDays = [
    {
      milestone_id: 1, title: 'Research Exchange Programs',
      deadline_utc: in5d, milestone_type: 'UW Internal',
      phase: 'Research', is_completed: false,
      prerequisite_id: null, prerequisite_completed: null,
      destination_country: null, days_remaining: 5,
      is_approaching_48h: false, is_approaching_7d: true, is_overdue: false,
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockWithDays) })
    );
  });

  afterEach(() => { jest.clearAllMocks(); });

  test('AC#2 — days remaining label is shown on an incomplete milestone', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => {
      expect(screen.getByText(/days remaining/i)).toBeInTheDocument();
    });
  });

  test('AC#2 — days remaining shows the correct number', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => {
      expect(screen.getByText(/5 days remaining/i)).toBeInTheDocument();
    });
  });

  test('AC#2 — completed milestones do not show days remaining', async () => {
    const completedMock = [{ ...mockWithDays[0], is_completed: true }];
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(completedMock) })
    );
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => {
      expect(screen.queryByText(/days remaining/i)).not.toBeInTheDocument();
    });
  });
});

describe('Sprint 2 — Destination Filter (Story 3)', () => {
  const now = new Date();
  const in25d = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString();

  const mockWithDest = [
    {
      milestone_id: 3, title: 'Apply to Host University',
      deadline_utc: in25d, milestone_type: 'Host University',
      phase: 'Host Application', is_completed: false,
      destination_country: 'Australia', days_remaining: 25,
      is_approaching_48h: false, is_approaching_7d: false, is_overdue: false,
    },
    {
      milestone_id: 4, title: 'Submit Housing Application',
      deadline_utc: in25d, milestone_type: 'Host University',
      phase: 'Host Application', is_completed: false,
      destination_country: 'Germany', days_remaining: 25,
      is_approaching_48h: false, is_approaching_7d: false, is_overdue: false,
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockWithDest) })
    );
  });

  afterEach(() => { jest.clearAllMocks(); });

  test('AC#3 — destination-matching milestone gets destination-match class', async () => {
    render(<Timeline currentUser="testuser" destination="Australia" />);
    await waitFor(() => {
      const milestone = screen.getByText('Apply to Host University').closest('.tl-milestone');
      expect(milestone).toHaveClass('destination-match');
    });
  });

  test('AC#3 — non-matching destination milestone does not get destination-match class', async () => {
    render(<Timeline currentUser="testuser" destination="Australia" />);
    await waitFor(() => {
      const milestone = screen.getByText('Submit Housing Application').closest('.tl-milestone');
      expect(milestone).not.toHaveClass('destination-match');
    });
  });

  test('AC#3 — destination filter input is rendered', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Apply to Host University'));
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
  });

  test('AC#3 — typing in destination filter updates the input', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Apply to Host University'));

    const destInput = screen.getByLabelText(/destination/i);
    fireEvent.change(destInput, { target: { value: 'Japan' } });
    expect(destInput.value).toBe('Japan');
  });
});

describe('Sprint 2 — Filter Calendar by Phase (Story 2 Filter)', () => {
  const now = new Date();
  const in10d = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();

  const mockPhased = [
    {
      milestone_id: 1, title: 'Research Exchange Programs',
      deadline_utc: in10d, milestone_type: 'UW Internal',
      phase: 'Research', is_completed: false,
      destination_country: null, days_remaining: 10,
      is_approaching_48h: false, is_approaching_7d: false, is_overdue: false,
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockPhased) })
    );
  });

  afterEach(() => { jest.clearAllMocks(); });

  test('phase filter dropdown is rendered with all phase options', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Research Exchange Programs'));

    const phaseSelect = screen.getByLabelText(/phase/i);
    expect(phaseSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /research/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /nomination/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /host application/i })).toBeInTheDocument();
  });

  test('changing phase filter refetches milestones with phase param', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Research Exchange Programs'));

    const phaseSelect = screen.getByLabelText(/phase/i);
    fireEvent.change(phaseSelect, { target: { value: 'Nomination' } });

    await waitFor(() => {
      const calls = global.fetch.mock.calls.filter(c => c[0]?.includes('/milestones'));
      const lastUrl = calls[calls.length - 1][0];
      expect(lastUrl).toContain('phase=Nomination');
    });
  });

  test('clear filters button appears when a filter is active', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Research Exchange Programs'));

    const phaseSelect = screen.getByLabelText(/phase/i);
    fireEvent.change(phaseSelect, { target: { value: 'Research' } });

    await waitFor(() => {
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
    });
  });

  test('clicking clear filters resets phase and destination', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Research Exchange Programs'));

    const phaseSelect = screen.getByLabelText(/phase/i);
    fireEvent.change(phaseSelect, { target: { value: 'Research' } });

    await waitFor(() => screen.getByText(/clear filters/i));
    fireEvent.click(screen.getByText(/clear filters/i));

    expect(phaseSelect.value).toBe('');
  });
});