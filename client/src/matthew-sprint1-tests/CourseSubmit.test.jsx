import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseSubmit from '../components/CourseSubmit';

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockReset();
});

// Helper: fill in all required fields
const fillRequiredFields = async () => {
  await userEvent.type(screen.getByPlaceholderText(/your username/i), 'testuser');
  await userEvent.type(screen.getByPlaceholderText(/e.g. MSCI 342/i), 'MSCI 342');
  await userEvent.type(screen.getByPlaceholderText(/e.g. Engineering Economics/i), 'Engineering Economics');
  await userEvent.type(screen.getByPlaceholderText(/e.g. BUS 201/i), 'BUS 201');
  await userEvent.type(screen.getByPlaceholderText(/e.g. Introduction to Business/i), 'Business Economics');
  await userEvent.type(screen.getByPlaceholderText(/e.g. University of Melbourne/i), 'University of Melbourne');
  // Proof URL
  await userEvent.type(screen.getByPlaceholderText(/https:\/\//i), 'https://example.com/proof.pdf');
};

// =============================================================================
// RENDERING
// =============================================================================

describe('CourseSubmit — rendering', () => {
  test('renders all form sections', () => {
    render(<CourseSubmit currentUser="testuser" />);

    expect(screen.getByText(/Upload Course Equivalency/i)).toBeInTheDocument();
    expect(screen.getByText(/UW Course Equivalent/i)).toBeInTheDocument();
    expect(screen.getByText(/Host Institution Course/i)).toBeInTheDocument();
    expect(screen.getByText(/Host University Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Proof of Match/i)).toBeInTheDocument();
  });

  test('AC#9 — submit button is disabled when no proof is provided', () => {
    render(<CourseSubmit currentUser="testuser" />);
    const submitBtn = screen.getByRole('button', { name: /submit course/i });
    expect(submitBtn).toBeDisabled();
  });

  test('AC#9 — submit button enables after proof URL is entered', async () => {
    render(<CourseSubmit currentUser="testuser" />);
    const proofInput = screen.getByPlaceholderText(/https:\/\//i);
    await userEvent.type(proofInput, 'https://example.com/proof.pdf');

    const submitBtn = screen.getByRole('button', { name: /submit course/i });
    expect(submitBtn).not.toBeDisabled();
  });
});

// =============================================================================
// VALIDATION
// =============================================================================

describe('CourseSubmit — validation', () => {
  test('AC#2 — shows error when required field is empty on submit', async () => {
    render(<CourseSubmit currentUser="testuser" />);

    // Only fill proof so button is enabled, leave other required fields empty
    await userEvent.type(screen.getByPlaceholderText(/https:\/\//i), 'https://proof.com');
    await userEvent.click(screen.getByRole('button', { name: /submit course/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  test('AC#5 upload — shows error for invalid UW course code format', async () => {
    render(<CourseSubmit currentUser="testuser" />);

    const uwCodeInput = screen.getByPlaceholderText(/e.g. MSCI 342/i);
    await userEvent.type(uwCodeInput, 'INVALID###');
    await userEvent.type(screen.getByPlaceholderText(/https:\/\//i), 'https://proof.com');

    // Fill remaining required fields
    await userEvent.type(screen.getByPlaceholderText(/your username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/e.g. Engineering Economics/i), 'Engineering Economics');
    await userEvent.type(screen.getByPlaceholderText(/e.g. BUS 201/i), 'BUS 201');
    await userEvent.type(screen.getByPlaceholderText(/e.g. Introduction to Business/i), 'Business Econ');
    await userEvent.type(screen.getByPlaceholderText(/e.g. University of Melbourne/i), 'U Melbourne');

    await userEvent.click(screen.getByRole('button', { name: /submit course/i }));

    await waitFor(() => {
      expect(screen.getByText(/format like MSCI 342/i)).toBeInTheDocument();
    });
  });

  test('AC#8 upload — first empty field is focused when form is submitted incomplete', async () => {
    render(<CourseSubmit currentUser="testuser" />);
    await userEvent.type(screen.getByPlaceholderText(/https:\/\//i), 'https://proof.com');

    await userEvent.click(screen.getByRole('button', { name: /submit course/i }));

    await waitFor(() => {
      // username field should be focused as first required field
      const usernameInput = screen.getByPlaceholderText(/your username/i);
      expect(document.activeElement).toBe(usernameInput);
    });
  });
});

// =============================================================================
// SUBMISSION
// =============================================================================

describe('CourseSubmit — submission', () => {
  test('AC#1 upload — successful submit calls POST /api/courses', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Course submitted successfully. It will be visible after review.',
        course_id: 42,
        status: 'Pending Review',
      }),
    });

    render(<CourseSubmit currentUser="testuser" />);
    await fillRequiredFields();

    await userEvent.click(screen.getByRole('button', { name: /submit course/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/courses'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('AC#6 upload — shows success confirmation banner after submit', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Course submitted successfully. It will be visible after review.',
        course_id: 42,
        status: 'Pending Review',
      }),
    });

    render(<CourseSubmit currentUser="testuser" />);
    await fillRequiredFields();
    await userEvent.click(screen.getByRole('button', { name: /submit course/i }));

    await waitFor(() => {
      expect(screen.getByText(/Course submitted successfully/i)).toBeInTheDocument();
    });
  });

  test('AC#10 upload — success banner shows Pending Review status', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Course submitted successfully. It will be visible after review.',
        course_id: 42,
        status: 'Pending Review',
      }),
    });

    render(<CourseSubmit currentUser="testuser" />);
    await fillRequiredFields();
    await userEvent.click(screen.getByRole('button', { name: /submit course/i }));

    await waitFor(() => {
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });

  test('AC#4 upload — shows duplicate error message from server', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'This course equivalency has already been submitted.' }),
    });

    render(<CourseSubmit currentUser="testuser" />);
    await fillRequiredFields();
    await userEvent.click(screen.getByRole('button', { name: /submit course/i }));

    await waitFor(() => {
      expect(screen.getByText(/already been submitted/i)).toBeInTheDocument();
    });
  });

  test('resets form after successful submission', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Course submitted successfully.',
        course_id: 42,
        status: 'Pending Review',
      }),
    });

    render(<CourseSubmit currentUser="testuser" />);
    await fillRequiredFields();
    await userEvent.click(screen.getByRole('button', { name: /submit course/i }));

    await waitFor(() => {
      const uwCodeInput = screen.getByPlaceholderText(/e.g. MSCI 342/i);
      expect(uwCodeInput.value).toBe('');
    });
  });
});