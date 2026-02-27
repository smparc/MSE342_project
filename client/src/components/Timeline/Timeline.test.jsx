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