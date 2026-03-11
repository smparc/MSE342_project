import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserTypeSelect from './index';

describe('UserTypeSelect Component (Story 7)', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('AC#1 — renders all 4 user type options', () => {
    render(<UserTypeSelect currentUser="testuser" />);
    expect(screen.getByLabelText(/current exchange student/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prospective exchange student/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/exchange alumni/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/just browsing/i)).toBeInTheDocument();
  });

  test('AC#2 — clicking an option selects it', () => {
    render(<UserTypeSelect currentUser="testuser" />);
    const option = screen.getByLabelText(/prospective exchange student/i);
    fireEvent.click(option);
    expect(option).toBeChecked();
  });

  test('AC#3 — only one option can be selected at a time', () => {
    render(<UserTypeSelect currentUser="testuser" />);
    const prospect = screen.getByLabelText(/prospective exchange student/i);
    const alumni   = screen.getByLabelText(/exchange alumni/i);
    fireEvent.click(prospect);
    fireEvent.click(alumni);
    expect(alumni).toBeChecked();
    expect(prospect).not.toBeChecked();
  });

  test('AC#4 — saving calls PUT /api/users/:username/type with correct body', async () => {
    render(<UserTypeSelect currentUser="testuser" />);
    fireEvent.click(screen.getByLabelText(/prospective exchange student/i));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      const putCall = global.fetch.mock.calls.find(
        c => c[0]?.includes('/api/users/') && c[1]?.method === 'PUT'
      );
      expect(putCall).toBeDefined();
      expect(JSON.parse(putCall[1].body).user_type).toBe('prospective');
    });
  });

  test('AC#5 — shows success confirmation after saving', async () => {
    render(<UserTypeSelect currentUser="testuser" />);
    fireEvent.click(screen.getByLabelText(/prospective exchange student/i));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });

  test('AC#6 — pre-fills current user type when provided', () => {
    render(<UserTypeSelect currentUser="testuser" currentUserType="alumni" />);
    expect(screen.getByLabelText(/exchange alumni/i)).toBeChecked();
  });

  test('AC#7 — each option shows a description of who it is for', () => {
    render(<UserTypeSelect currentUser="testuser" />);
    expect(screen.getByText(/currently studying abroad/i)).toBeInTheDocument();
  });

  test('save button is disabled when no option is selected', () => {
    render(<UserTypeSelect currentUser="testuser" />);
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  test('save button is enabled after selecting an option', () => {
    render(<UserTypeSelect currentUser="testuser" />);
    fireEvent.click(screen.getByLabelText(/just browsing/i));
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
  });
});