/**
 * Messaging component unit tests.
 * Messaging uses react-router (useLocation, useNavigate), FirebaseContext, and a specific fetch sequence on conversation select.
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Messaging from './index';
import { FirebaseContext } from '../Firebase';
import appTheme from '../../theme/appTheme';

jest.mock('../Firebase/firebase', () => ({
  __esModule: true,
  default: class MockFirebase {
    constructor() {
      this.auth = {};
      this.googleProvider = {};
    }
  },
}));

const mockFirebase = {
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  },
};

const mockConversationList = [
  { id: '1', senderName: 'Alice', lastMessage: 'Hi there', lastMessageAt: '2025-01-15T10:00:00Z', unread: 0 },
  { id: '2', senderName: 'Bob', lastMessage: 'See you', lastMessageAt: '2025-01-14T09:00:00Z', unread: 0 },
];

const mockMessages = [
  { id: 'm1', senderId: 'alice', senderName: 'Alice', content: 'Hello!', created_at: '2025-01-15T10:00:00Z' },
  { id: 'm2', senderId: 'bob', senderName: 'Bob', content: 'Hi back', created_at: '2025-01-15T10:01:00Z' },
];

/**
 * Default fetch: messages list, mark-read PUT, GET messages, POST send, extra list refreshes.
 */
function setupSuccessfulFetchMocks() {
  global.fetch = jest.fn((url, options = {}) => {
    const u = String(url);
    const method = options.method || 'GET';

    if (u.includes('/api/messages-list')) {
      return Promise.resolve({
        ok: true,
        json: async () => mockConversationList,
      });
    }

    if (u.includes('/read') && method === 'PUT') {
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }

    if (u.includes('/api/conversations/') && u.includes('/messages')) {
      if (method === 'POST') {
        const body = options.body && typeof options.body === 'string' ? JSON.parse(options.body) : {};
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({
            id: 'm3',
            senderId: 'elly',
            content: body.content || 'New message',
            created_at: '2025-01-15T10:05:00Z',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockMessages,
      });
    }

    return Promise.resolve({ ok: false, json: async () => ({ error: 'unmocked', url: u }) });
  });
}

function renderMessaging(ui = <Messaging />) {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={appTheme}>
        <FirebaseContext.Provider value={mockFirebase}>{ui}</FirebaseContext.Provider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Messaging', () => {
  beforeEach(() => {
    setupSuccessfulFetchMocks();
    jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial load and conversation list', () => {
    it('fetches conversation list on mount', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/messages-list\?username=/)
        );
      });
    });

    it('shows error message when conversation list fails to load', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText(/Messages failed to load. Please try again later./i)).toBeInTheDocument();
      });
    });

    it('shows error message when API returns non-array response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Unauthorized' }),
        })
      );

      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText(/Messages failed to load. Please try again later./i)).toBeInTheDocument();
      });
    });

    it('shows conversation list when API returns conversations', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });

    it('shows "Select a conversation" when no conversation is selected', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      expect(screen.getByText(/Select a conversation to start messaging/i)).toBeInTheDocument();
    });
  });

  describe('selecting a conversation', () => {
    it('fetches messages when a conversation is selected', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Alice'));

      await waitFor(() => {
        expect(
          global.fetch.mock.calls.some(
            (call) =>
              typeof call[0] === 'string' &&
              call[0].includes('/api/conversations/1/messages') &&
              call[0].includes('username=')
          )
        ).toBe(true);
      });
    });

    it('shows conversation name and message input when conversation is selected', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Alice'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
      });
      expect(screen.getAllByRole('heading', { name: 'Alice' }).length).toBeGreaterThanOrEqual(1);
    });

    it('displays messages in the selected conversation', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Alice'));

      await waitFor(() => {
        expect(screen.getByText('Hello!')).toBeInTheDocument();
        expect(screen.getByText('Hi back')).toBeInTheDocument();
      });
    });
  });

  describe('sending a message', () => {
    it('calls send API when user submits a message', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Alice'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Type a message/i);
      fireEvent.change(input, { target: { value: 'New message' } });
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));

      await waitFor(() => {
        const postCalls = global.fetch.mock.calls.filter(
          (call) => call[1] && call[1].method === 'POST' && String(call[0]).includes('/messages')
        );
        expect(postCalls.length).toBeGreaterThanOrEqual(1);
        expect(postCalls[0][0]).toMatch(/\/api\/conversations\/1\/messages/);
        expect(JSON.parse(postCalls[0][1].body)).toEqual({ content: 'New message' });
      });
    });

    it('does not send when input is empty', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Alice'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', { name: /Send/i });
      expect(sendButton).toBeDisabled();
    });
  });

  describe('layout and structure', () => {
    it('renders Messages heading in the conversation list', async () => {
      renderMessaging();

      await waitFor(() => {
        expect(screen.getByText('Messages')).toBeInTheDocument();
      });
    });
  });
});
