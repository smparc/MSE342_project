/**
 * Messaging component unit tests (outside-in TDD style).
 * These tests describe the expected behavior of the Messaging feature
 * as if written before implementation.
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Messaging from './index';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Messaging', () => {
  const mockConversationList = [
    { id: '1', senderName: 'Alice', lastMessage: 'Hi there', lastMessageAt: '2025-01-15T10:00:00Z', unread: 0 },
    { id: '2', senderName: 'Bob', lastMessage: 'See you', lastMessageAt: '2025-01-14T09:00:00Z', unread: 0 },
  ];

  const mockMessages = [
    { id: 'm1', senderId: '1', senderName: 'Alice', content: 'Hello!', created_at: '2025-01-15T10:00:00Z' },
    { id: 'm2', senderId: '2', senderName: 'Bob', content: 'Hi back', created_at: '2025-01-15T10:01:00Z' },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial load and conversation list', () => {
    it('fetches conversation list on mount', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversationList,
      });

      renderWithTheme(<Messaging />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/messages-list/)
        );
      });
    });

    it('shows error message when conversation list fails to load', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<Messaging />);

      await waitFor(() => {
        expect(screen.getByText(/Messages failed to load. Please try again later./i)).toBeInTheDocument();
      });
    });

    it('shows error message when API returns non-array response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      renderWithTheme(<Messaging />);

      await waitFor(() => {
        expect(screen.getByText(/Messages failed to load. Please try again later./i)).toBeInTheDocument();
      });
    });

    it('shows conversation list when API returns conversations', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversationList,
      });

      renderWithTheme(<Messaging />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });

    it('shows "Select a conversation" when no conversation is selected', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversationList,
      });

      renderWithTheme(<Messaging />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      expect(screen.getByText(/Select a conversation to start messaging/i)).toBeInTheDocument();
    });
  });

  describe('selecting a conversation', () => {
    it('fetches messages when a conversation is selected', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMessages,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        });

      renderWithTheme(<Messaging />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Alice'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/conversations\/1\/messages/)
        );
      });
    });

    it('shows conversation name and message input when conversation is selected', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMessages,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        });

      renderWithTheme(<Messaging />);

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
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMessages,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        });

      renderWithTheme(<Messaging />);

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
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMessages,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({
            id: 'm3',
            senderId: '2',
            senderName: 'Me',
            content: 'New message',
            created_at: '2025-01-15T10:05:00Z',
          }),
        });

      renderWithTheme(<Messaging />);

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
          (call) => call[1] && call[1].method === 'POST'
        );
        expect(postCalls.length).toBeGreaterThanOrEqual(1);
        expect(postCalls[0][0]).toMatch(/\/api\/conversations\/1\/messages/);
        expect(JSON.parse(postCalls[0][1].body)).toEqual({ content: 'New message' });
      });
    });

    it('does not send when input is empty', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMessages,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockConversationList,
        });

      renderWithTheme(<Messaging />);

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
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversationList,
      });

      renderWithTheme(<Messaging />);

      await waitFor(() => {
        expect(screen.getByText('Messages')).toBeInTheDocument();
      });
    });
  });
});
