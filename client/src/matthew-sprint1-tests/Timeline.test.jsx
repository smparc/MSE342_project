import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Timeline from '../../components/Timeline';

global.fetch = jest.fn();

const now = new Date();
const in30h  = new Date(now.getTime() + 30  * 60 * 60 * 1000).toISOString();
const in5d   = new Date(now.getTime() + 5   * 24 * 60 * 60 * 1000).toISOString();
const in10d  = new Date(now.getTime() + 10  * 24 * 60 * 60 * 1000).toISOString();
const past   = new Date(now.getTime() - 24  * 60 * 60 * 1000).toISOString();

const mockMilestones = [
  {
    milestone_id: 1,
    title: 'Submit Study Plan',
    deadline_utc: in5d,
    milestone_type: 'UW Internal',
    is_completed: false,
    prerequisite_id: null,
    prerequisite_title: null,
    prerequisite_completed: null,
    form_link: 'https://waterlooabroad.uwaterloo.ca',
    is_approaching_48h: false,
    is_approaching_7d: true,
    is_overdue: false,
    buffer_days: null,
  },
  {
    milestone_id: 2,
    title: 'Apply to Host University',
    deadline_utc: in10d,
    milestone_type: 'Host University',
    is_completed: false,
    prerequisite_id: 1,
    prerequisite_title: 'Submit Study Plan',
    prerequisite_completed: false,
    form_link: null,
    is_approaching_48h: false,
    is_approaching_7d: false,
    is_overdue: false,
    buffer_days: null,
  },
];

const mockFetchMilestones = (milestones = mockMilestones) => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => milestones,
  });
};

beforeEach(() => {
  fetch.mockReset();
  mockFetchMilestones();
});

// =============================================================================
// RENDERING
// =============================================================================

describe('Timeline — rendering', () => {
  test('AC#1 — renders timeline tab with milestones', async () => {
    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText('Submit Study Plan')).toBeInTheDocument();
      expect(screen.getByText('Apply to Host University')).toBeInTheDocument();
    });
  });

  test('renders progress bar', async () => {
    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/Application Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/0\/2 milestones complete/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no milestones exist', async () => {
    fetch.mockReset();
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/No milestones yet/i)).toBeInTheDocument();
    });
  });

  test('renders Export .ics and Add Milestone buttons', async () => {
    render(<Timeline currentUser="testuser" />);

    expect(screen.getByText(/Export .ics/i)).toBeInTheDocument();
    expect(screen.getByText(/\+ Add Milestone/i)).toBeInTheDocument();
  });
});

// =============================================================================
// URGENCY FLAGS
// =============================================================================

describe('Timeline — urgency highlighting', () => {
  test('AC#2 — milestone within 48h shows urgent status label', async () => {
    fetch.mockReset();
    mockFetchMilestones([{
      ...mockMilestones[0],
      deadline_utc: in30h,
      is_approaching_48h: true,
      is_approaching_7d: true,
    }]);

    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/< 48 hrs/i)).toBeInTheDocument();
    });
  });

  test('AC#4 — milestone within 7 days shows "Due soon" label', async () => {
    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/Due soon/i)).toBeInTheDocument();
    });
  });

  test('overdue milestone shows overdue status', async () => {
    fetch.mockReset();
    mockFetchMilestones([{
      ...mockMilestones[0],
      deadline_utc: past,
      is_approaching_48h: false,
      is_approaching_7d: false,
      is_overdue: true,
    }]);

    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/Overdue/i)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// MARK COMPLETE
// =============================================================================

describe('Timeline — mark complete (AC#3)', () => {
  test('clicking checkbox calls PATCH milestone endpoint', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Milestone updated' }),
    });
    // Re-fetch after patch
    mockFetchMilestones([{ ...mockMilestones[0], is_completed: true }]);

    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Submit Study Plan'));

    const checkboxes = document.querySelectorAll('.tl-checkbox:not(.disabled)');
    await userEvent.click(checkboxes[0]);

    await waitFor(() => {
      const patchCall = fetch.mock.calls.find(c =>
        c[0].includes('/api/milestones/') && c[1]?.method === 'PATCH'
      );
      expect(patchCall).toBeDefined();
      expect(JSON.parse(patchCall[1].body).is_completed).toBe(true);
    });
  });

  test('progress bar updates after completing a milestone', async () => {
    fetch.mockReset();
    mockFetchMilestones([
      { ...mockMilestones[0], is_completed: true },
      mockMilestones[1],
    ]);

    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/1\/2 milestones complete/i)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// PREREQUISITE / LOCKING (AC#7)
// =============================================================================

describe('Timeline — dependency locking (AC#7)', () => {
  test('locked milestone shows lock icon on checkbox', async () => {
    render(<Timeline currentUser="testuser" />);

    await waitFor(() => screen.getByText('Apply to Host University'));

    // The second milestone has a prerequisite not yet complete — should be locked
    const lockedCheckboxes = document.querySelectorAll('.tl-checkbox.disabled');
    expect(lockedCheckboxes.length).toBeGreaterThan(0);
  });

  test('locked milestone shows prerequisite name', async () => {
    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/Submit Study Plan/i)).toBeInTheDocument();
    });
  });

  test('locked milestone checkbox does not trigger PATCH when clicked', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Apply to Host University'));

    const lockedCheckbox = document.querySelector('.tl-checkbox.disabled');
    if (lockedCheckbox) await userEvent.click(lockedCheckbox);

    const patchCalls = fetch.mock.calls.filter(c =>
      c[0]?.includes('/api/milestones/') && c[1]?.method === 'PATCH'
    );
    expect(patchCalls.length).toBe(0);
  });
});

// =============================================================================
// FORM LINK (AC#5)
// =============================================================================

describe('Timeline — form links (AC#5)', () => {
  test('clicking a milestone expands to show form link', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Submit Study Plan'));

    const milestoneBody = screen.getByText('Submit Study Plan').closest('.tl-ms-body');
    await userEvent.click(milestoneBody);

    await waitFor(() => {
      expect(screen.getByText(/Open Required Form/i)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// BUFFER STATUS (AC#10)
// =============================================================================

describe('Timeline — buffer status (AC#10)', () => {
  test('completed milestone ahead of deadline shows buffer days', async () => {
    fetch.mockReset();
    mockFetchMilestones([{
      ...mockMilestones[0],
      is_completed: true,
      buffer_days: 5,
    }]);

    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Submit Study Plan'));

    const milestoneBody = screen.getByText('Submit Study Plan').closest('.tl-ms-body');
    await userEvent.click(milestoneBody);

    await waitFor(() => {
      expect(screen.getByText(/5 days ahead of deadline/i)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// FILTER TOGGLE (AC#9)
// =============================================================================

describe('Timeline — filter toggle (AC#9)', () => {
  test('clicking UW Internal filter fetches with type param', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Submit Study Plan'));

    fetch.mockReset();
    mockFetchMilestones([mockMilestones[0]]);

    await userEvent.click(screen.getByText('UW Internal'));

    await waitFor(() => {
      const filterCall = fetch.mock.calls.find(c =>
        c[0]?.includes('type=UW+Internal') || c[0]?.includes('type=UW%20Internal')
      );
      expect(filterCall).toBeDefined();
    });
  });

  test('clicking All resets filter and fetches without type param', async () => {
    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText('Submit Study Plan'));

    // First set a filter
    fetch.mockReset();
    mockFetchMilestones();
    await userEvent.click(screen.getByText('UW Internal'));

    // Then clear it
    fetch.mockReset();
    mockFetchMilestones();
    await userEvent.click(screen.getByText('All'));

    await waitFor(() => {
      const allCall = fetch.mock.calls.find(c =>
        c[0]?.includes('/api/users/') && !c[0]?.includes('type=')
      );
      expect(allCall).toBeDefined();
    });
  });
});

// =============================================================================
// ADD MILESTONE MODAL
// =============================================================================

describe('Timeline — add milestone modal', () => {
  test('opens add milestone modal when button is clicked', async () => {
    render(<Timeline currentUser="testuser" />);

    await userEvent.click(screen.getByText(/\+ Add Milestone/i));

    expect(screen.getByText(/Add Milestone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Submit Study Plan/i)).toBeInTheDocument();
  });

  test('shows validation error if title is missing on submit', async () => {
    render(<Timeline currentUser="testuser" />);

    await userEvent.click(screen.getByText(/\+ Add Milestone/i));

    // Click Add without filling fields
    const addBtns = screen.getAllByText(/Add Milestone/i);
    await userEvent.click(addBtns[addBtns.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    });
  });

  test('submits new milestone and closes modal on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ milestone_id: 99 }),
    });
    mockFetchMilestones();

    render(<Timeline currentUser="testuser" />);
    await userEvent.click(screen.getByText(/\+ Add Milestone/i));

    await userEvent.type(screen.getByPlaceholderText(/Submit Study Plan/i), 'New Task');
    const dateInput = document.querySelector('input[type="datetime-local"]');
    fireEvent.change(dateInput, { target: { value: '2025-06-01T12:00' } });

    const addBtns = screen.getAllByText(/Add Milestone/i);
    await userEvent.click(addBtns[addBtns.length - 1]);

    await waitFor(() => {
      const postCall = fetch.mock.calls.find(c =>
        c[0]?.includes('/milestones') && c[1]?.method === 'POST'
      );
      expect(postCall).toBeDefined();
    });
  });
});

// =============================================================================
// EXPORT ICS (AC#8)
// =============================================================================

describe('Timeline — export ICS (AC#8)', () => {
  test('clicking Export .ics opens the export URL', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});

    render(<Timeline currentUser="testuser" />);
    await waitFor(() => screen.getByText(/Export .ics/i));

    await userEvent.click(screen.getByText(/Export .ics/i));

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('/milestones/export'),
      '_blank'
    );

    openSpy.mockRestore();
  });
});

// =============================================================================
// TIMEZONE DISPLAY (AC#6)
// =============================================================================

describe('Timeline — timezone display (AC#6)', () => {
  test('deadline is displayed with EST label', async () => {
    render(<Timeline currentUser="testuser" />);

    await waitFor(() => {
      expect(screen.getByText(/EST/i)).toBeInTheDocument();
    });
  });
});