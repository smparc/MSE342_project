import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseSubmit from './index';

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
    const submitButton = screen.getByText('Submit Course');
    
    // The button is disabled until proof is provided. Let's force a proof URL to test other fields.
    const proofInput = screen.getByPlaceholderText('https://…');
    fireEvent.change(proofInput, { target: { value: 'https://example.com/proof.pdf' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('UW course code is required')).toBeInTheDocument();
    });
  });

  test('validates UW course code format', async () => {
    render(<CourseSubmit currentUser="testuser" />);
    
    const uwCodeInput = screen.getByPlaceholderText('e.g. MSCI 342');
    fireEvent.change(uwCodeInput, { target: { value: 'INVALID123' } });
    
    const proofInput = screen.getByPlaceholderText('https://…');
    fireEvent.change(proofInput, { target: { value: 'https://example.com/proof.pdf' } });

    fireEvent.click(screen.getByText('Submit Course'));

    await waitFor(() => {
      expect(screen.getByText('Use format like MSCI 342 or CS 341')).toBeInTheDocument();
    });
  });

  test('submits successfully when fields are valid', async () => {
    render(<CourseSubmit currentUser="testuser" />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. MSCI 342'), { target: { value: 'CS 341' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Engineering Economics'), { target: { value: 'Algorithms' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. BUS 201'), { target: { value: 'COMP 200' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Introduction to Business'), { target: { value: 'Algos' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. University of Melbourne'), { target: { value: 'Host Uni' } });
    fireEvent.change(screen.getByPlaceholderText('https://…'), { target: { value: 'https://example.com/proof' } });

    fireEvent.click(screen.getByText('Submit Course'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });
});