import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../Firebase', () => {
  const React = require('react');
  const Fc = React.createContext(null);
  return {
    __esModule: true,
    default: {},
    FirebaseContext: Fc,
    withFirebase: (Component) => (props) =>
      React.createElement(Fc.Consumer, null, (firebase) =>
        React.createElement(Component, { ...props, firebase })
      ),
  };
});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const { FirebaseContext } = require('../Firebase');
const SignIn = require('./index').default;

const createMockFirebase = (overrides = {}) => ({
  doSignInWithEmailAndPassword: jest.fn(),
  doCreateUserWithEmailAndPassword: jest.fn(),
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
    },
  },
  ...overrides,
});

const renderWithProviders = (ui, { firebase = null } = {}) => {
  const mockFirebase = firebase || createMockFirebase();

  return render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <FirebaseContext.Provider value={mockFirebase}>
          {ui}
        </FirebaseContext.Provider>
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('SignIn Component', () => {
  let mockFirebase;

  beforeEach(() => {
    mockNavigate.mockClear();
    mockFirebase = createMockFirebase();
    global.fetch = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders sign in form with Welcome Back heading by default', () => {
    renderWithProviders(<SignIn />, { firebase: mockFirebase });
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i })).toBeInTheDocument();
  });

  it('renders sign up form when clicking Sign Up link', () => {
    renderWithProviders(<SignIn />, { firebase: mockFirebase });
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('shows validation error when signing in with empty email', async () => {
    renderWithProviders(<SignIn />, { firebase: mockFirebase });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is required to log in/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when signing up without username in step 1', async () => {
    renderWithProviders(<SignIn />, { firebase: mockFirebase });
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    // Leave username empty
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    });
  });

  it('navigates to step 2 when valid sign up data is submitted in step 1', async () => {
    renderWithProviders(<SignIn />, { firebase: mockFirebase });
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'student@uwaterloo.ca' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'student1' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
    });
  });

  it('displays error message when sign in fails with invalid credentials', async () => {
    mockFirebase.doSignInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-credential' });

    renderWithProviders(<SignIn />, { firebase: mockFirebase });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('displays error when sign up API fails', async () => {
    mockFirebase.doCreateUserWithEmailAndPassword.mockResolvedValueOnce();
    mockFirebase.auth.currentUser.getIdToken.mockResolvedValueOnce('mock-token');
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Username already exists' }) });

    renderWithProviders(<SignIn />, { firebase: mockFirebase });
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => screen.getByText('Profile Information'));

    fireEvent.click(screen.getByRole('button', { name: /Complete Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username already exists/i)).toBeInTheDocument();
    });
  });
});
