import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DeleteAccount from './index';

jest.mock('./DeleteAccount.css', () => ({}), { virtual: true });

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

global.fetch = jest.fn();

const renderDeleteAccount = (props = {}) =>
  render(
    <MemoryRouter>
      <DeleteAccount currentUser="testuser" {...props} />
    </MemoryRouter>
  );

beforeEach(() => {
  fetch.mockReset();
  mockNavigate.mockReset();
});

// =============================================================================
// STORY 6 — Delete Account (7 ACs)
// =============================================================================

describe('Story 6 — Delete Account', () => {
  // AC#1 — delete button shows confirmation prompt
  test('AC#1 — Delete my account button is visible on settings page', () => {
    renderDeleteAccount();
    expect(screen.getByRole('button', { name: /delete my account/i })).toBeInTheDocument();
  });

  test('AC#1 — clicking Delete my account shows confirmation prompt', async () => {
    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    expect(screen.getByText(/Are you sure you want to delete your account\?/i)).toBeInTheDocument();
  });

  test('AC#1 — confirmation prompt shows Yes and No buttons', async () => {
    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    expect(screen.getByRole('button', { name: /^Yes$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^No$/i })).toBeInTheDocument();
  });

  // AC#2 — clicking No closes prompt, no changes
  test('AC#2 — clicking No closes the confirmation prompt', async () => {
    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^No$/i }));
    expect(screen.queryByText(/Are you sure you want to delete your account\?/i)).not.toBeInTheDocument();
  });

  test('AC#2 — clicking No does NOT call the delete API', async () => {
    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^No$/i }));
    expect(fetch).not.toHaveBeenCalled();
  });

  test('AC#2 — clicking No does NOT navigate away', async () => {
    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^No$/i }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // AC#3 — clicking Yes shows password entry
  test('AC#3 — clicking Yes shows password input', async () => {
    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^Yes$/i }));
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  test('AC#3 — password step shows a Confirm button', async () => {
    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^Yes$/i }));
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  // AC#4 — wrong password shows error, clears field
  test('AC#4 — wrong password shows "Password incorrect" error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false, status: 401,
      json: async () => ({ error: 'Password incorrect' }),
    });

    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^Yes$/i }));

    const pwInput = screen.getByPlaceholderText(/enter your password/i);
    await userEvent.type(pwInput, 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/Password incorrect/i)).toBeInTheDocument();
    });
  });

  test('AC#4 — password field is cleared after wrong password', async () => {
    fetch.mockResolvedValueOnce({
      ok: false, status: 401,
      json: async () => ({ error: 'Password incorrect' }),
    });

    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^Yes$/i }));

    const pwInput = screen.getByPlaceholderText(/enter your password/i);
    await userEvent.type(pwInput, 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(pwInput.value).toBe('');
    });
  });

  // AC#5 — correct password redirects to login with farewell message
  test('AC#5 — correct password calls DELETE /api/users/:username', async () => {
    fetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: async () => ({ message: 'Account deleted successfully' }),
    });

    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^Yes$/i }));

    const pwInput = screen.getByPlaceholderText(/enter your password/i);
    await userEvent.type(pwInput, 'correctpassword');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      const deleteCalls = fetch.mock.calls.filter(c =>
        c[0]?.includes('/api/users/') && c[1]?.method === 'DELETE'
      );
      expect(deleteCalls.length).toBeGreaterThan(0);
    });
  });

  test('AC#5 — after correct password, navigates to sign-in page', async () => {
    fetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: async () => ({ message: 'Account deleted successfully' }),
    });

    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^Yes$/i }));

    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'correctpassword');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    // Farewell shows immediately; navigate fires inside setTimeout(2500).
    // Extend waitFor timeout past the component's 2500ms delay.
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    }, { timeout: 4000 });
  });

  test('AC#5 — farewell message is shown before redirect', async () => {
    fetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: async () => ({ message: 'Account deleted successfully' }),
    });

    renderDeleteAccount();
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    await userEvent.click(screen.getByRole('button', { name: /^Yes$/i }));

    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'correctpassword');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/You have deleted your account\. Farewell!/i)).toBeInTheDocument();
    });
  });
});