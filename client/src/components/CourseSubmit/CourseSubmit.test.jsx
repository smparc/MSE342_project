import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseSubmit from '.';

// Mock Firebase so authFetch doesn't error in tests
jest.mock('../Firebase', () => ({
  FirebaseContext: require('react').createContext(null),
  authFetch: jest.fn((url, options) =>
    fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } })
  ),
}));

describe('CourseSubmit Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success', status: 'Pending Review', course_id: 123 }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders submission form correctly', () => {
    render(<CourseSubmit currentUser="testuser" />);
    expect(screen.getByText('Upload Course Equivalency')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
  });

  test('displays validation errors when submitting empty form', async () => {
    render(<CourseSubmit currentUser="" />);
    fireEvent.click(screen.getByText('Submit Course'));
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('UW course code is required')).toBeInTheDocument();
    });
  });

  test('validates UW course code format', async () => {
    render(<CourseSubmit currentUser="testuser" />);
    fireEvent.change(screen.getByPlaceholderText('e.g. MSCI 342'), { target: { value: 'INVALID123' } });
    fireEvent.click(screen.getByText('Submit Course'));
    await waitFor(() => {
      expect(screen.getByText('Use format like MSCI 342 or CS 341')).toBeInTheDocument();
    });
  });

  test('submits successfully when fields are valid', async () => {
    render(<CourseSubmit currentUser="testuser" />);
    fireEvent.change(screen.getByPlaceholderText('e.g. MSCI 342'),                     { target: { value: 'CS 341' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Engineering Economics'),         { target: { value: 'Algorithms' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. BUS 201'),                       { target: { value: 'COMP 200' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Introduction to Business'),      { target: { value: 'Algos' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. University of Melbourne'),       { target: { value: 'Host Uni' } });
    fireEvent.click(screen.getByText('Submit Course'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// Sprint 3 — Story 4 AC4: Anonymous Posting
// =============================================================================

describe('Sprint 3 — Anonymous Posting (Story 4 AC4)', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success', status: 'Pending Review', course_id: 123 }),
      })
    );
  });

  afterEach(() => { jest.clearAllMocks(); });

  test('AC4 — "Post anonymously" checkbox is present', () => {
    render(<CourseSubmit currentUser="testuser" />);
    expect(screen.getByLabelText(/Post anonymously/i)).toBeInTheDocument();
  });

  test('AC4 — checkbox is unchecked by default', () => {
    render(<CourseSubmit currentUser="testuser" />);
    expect(screen.getByLabelText(/Post anonymously/i)).not.toBeChecked();
  });

  test('AC4 — checking the checkbox sets it to checked', () => {
    render(<CourseSubmit currentUser="testuser" />);
    const checkbox = screen.getByLabelText(/Post anonymously/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('AC4 — anonymous hint text is displayed', () => {
    render(<CourseSubmit currentUser="testuser" />);
    expect(screen.getByText(/Your name will be hidden/i)).toBeInTheDocument();
  });

  test('AC4 — submitting with anonymous checked sends is_anonymous: 1', async () => {
    render(<CourseSubmit currentUser="testuser" />);

    fireEvent.change(screen.getByPlaceholderText('e.g. MSCI 342'),                { target: { value: 'CS 341' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Engineering Economics'),    { target: { value: 'Algorithms' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. BUS 201'),                  { target: { value: 'COMP 200' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Introduction to Business'), { target: { value: 'Algos' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. University of Melbourne'),  { target: { value: 'Host Uni' } });

    fireEvent.click(screen.getByLabelText(/Post anonymously/i));
    fireEvent.click(screen.getByText('Submit Course'));

    await waitFor(() => {
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.is_anonymous).toBe(1);
    });
  });

  test('AC4 — submitting without anonymous sends is_anonymous: 0', async () => {
    render(<CourseSubmit currentUser="testuser" />);

    fireEvent.change(screen.getByPlaceholderText('e.g. MSCI 342'),                { target: { value: 'CS 341' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Engineering Economics'),    { target: { value: 'Algorithms' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. BUS 201'),                  { target: { value: 'COMP 200' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Introduction to Business'), { target: { value: 'Algos' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. University of Melbourne'),  { target: { value: 'Host Uni' } });
    fireEvent.click(screen.getByText('Submit Course'));

    await waitFor(() => {
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.is_anonymous).toBe(0);
    });
  });
});