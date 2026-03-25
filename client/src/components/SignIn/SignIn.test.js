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

function renderComponent(props = {}) {
  const firebase = props.firebase || createMockFirebase();
  return render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FirebaseContext.Provider value={firebase}>
          <SignIn {...props} />
        </FirebaseContext.Provider>
      </MemoryRouter>
    </ThemeProvider>
  );
}

// Submit form without triggering jsdom's unimplemented HTMLFormElement.submit
function submitForm(buttonName) {
  const button = screen.getByRole('button', { name: buttonName });
  const form = button.closest('form');
  if (form) fireEvent.submit(form);
  else fireEvent.click(button);
}

describe('SignIn', () => {
  let firebase;

  beforeEach(() => {
    mockNavigate.mockClear();
    firebase = createMockFirebase();
    global.fetch = jest.fn((url) => {
      const u = String(url);
      if (u.includes('/api/users/availability')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ emailTaken: false, usernameTaken: false }),
        });
      }
      return Promise.resolve({ ok: false, json: async () => ({ error: 'unmocked URL' }) });
    });
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('displays the sign in form', () => {
    renderComponent({ firebase });
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows sign up form when clicking Sign Up link', () => {
    renderComponent({ firebase });
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('shows validation error when signing in with empty email', async () => {
    renderComponent({ firebase });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    submitForm(/Sign In/i);

    await waitFor(() => {
      expect(screen.getByText(/Email is required to log in/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when signing up without username', async () => {
    renderComponent({ firebase });
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    submitForm(/Next/i);

    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    });
  });

  it('navigates to step 2 when valid sign up data is submitted', async () => {
    renderComponent({ firebase });
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'student@uwaterloo.ca' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'student1' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    submitForm(/Next/i);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Profile Information/i })).toBeInTheDocument();
    });
  });

  it('displays error when sign in fails with invalid credentials', async () => {
    firebase.doSignInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    renderComponent({ firebase });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    submitForm(/Sign In/i);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('displays error when sign up API fails', async () => {
    firebase.doCreateUserWithEmailAndPassword.mockResolvedValueOnce();
    firebase.auth.currentUser.getIdToken.mockResolvedValueOnce('mock-token');
    global.fetch.mockImplementation((url, options) => {
      const u = String(url);
      if (u.includes('/api/users/availability')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ emailTaken: false, usernameTaken: false }),
        });
      }
      if (options?.method === 'POST' && u.includes('/api/users')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Username already exists' }),
        });
      }
      return Promise.resolve({ ok: false, json: async () => ({ error: 'unmocked' }) });
    });

    renderComponent({ firebase });
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    submitForm(/Next/i);

    await waitFor(() => screen.getByRole('heading', { name: /Profile Information/i }));

    submitForm(/Next/i);

    await waitFor(() => screen.getByRole('heading', { name: /Tell us about yourself/i }));

    submitForm(/Complete Sign Up/i);

    await waitFor(() => {
      expect(screen.getByText(/Username already exists/i)).toBeInTheDocument();
    });
  });
});
