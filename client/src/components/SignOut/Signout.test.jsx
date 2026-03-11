import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SignOut from './index';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderSignOut = (props = {}) =>
  render(
    <MemoryRouter>
      <SignOut currentUser="testuser" onSignOut={jest.fn()} {...props} />
    </MemoryRouter>
  );

describe('SignOut Component (Story 8)', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
    );
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('AC#1 — sign out button is visible', () => {
    renderSignOut();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  test('AC#2 — clicking sign out calls the onSignOut callback', async () => {
    const mockSignOut = jest.fn();
    renderSignOut({ onSignOut: mockSignOut });
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  test('AC#3 — clicking sign out navigates to home page', async () => {
    renderSignOut();
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('AC#4 — clicking sign out calls POST /api/auth/signout', async () => {
    renderSignOut();
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    await waitFor(() => {
      const signOutCall = global.fetch.mock.calls.find(c => c[0]?.includes('/auth/signout'));
      expect(signOutCall).toBeDefined();
    });
  });

  test('AC#5 — with requireConfirm, shows confirmation prompt before signing out', async () => {
    renderSignOut({ requireConfirm: true });
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('AC#5 — confirming from the prompt completes sign out', async () => {
    const mockSignOut = jest.fn();
    renderSignOut({ requireConfirm: true, onSignOut: mockSignOut });
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    fireEvent.click(screen.getByRole('button', { name: /^sign out$/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('AC#5 — cancelling the confirmation prompt does not sign out', async () => {
    renderSignOut({ requireConfirm: true });
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });
});