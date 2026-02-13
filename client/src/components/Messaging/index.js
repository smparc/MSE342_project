import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

// Mock data - replace with API calls to your backend
const MOCK_CONVERSATIONS = [
  { id: '1', name: 'Alice Chen', lastMessage: 'Thanks for the update!', lastMessageAt: '10:30 AM', unread: 2 },
  { id: '2', name: 'Bob Smith', lastMessage: 'See you tomorrow', lastMessageAt: 'Yesterday', unread: 0 },
  { id: '3', name: 'Carol Jones', lastMessage: 'Can we reschedule?', lastMessageAt: 'Mon', unread: 1 },
];

const MOCK_MESSAGES = {
  '1': [
    { id: 'm1', text: 'Hey, how are you?', senderId: 'currentUser', timestamp: '10:25 AM' },
    { id: 'm2', text: 'I\'m good, thanks! Working on the project.', senderId: '1', timestamp: '10:27 AM' },
    { id: 'm3', text: 'Let me know when you have updates.', senderId: 'currentUser', timestamp: '10:28 AM' },
    { id: 'm4', text: 'Thanks for the update!', senderId: '1', timestamp: '10:30 AM' },
  ],
  '2': [
    { id: 'm5', text: 'Meeting at 3pm?', senderId: 'currentUser', timestamp: 'Yesterday' },
    { id: 'm6', text: 'See you tomorrow', senderId: '2', timestamp: 'Yesterday' },
  ],
  '3': [
    { id: 'm7', text: 'Are we still on for Friday?', senderId: '3', timestamp: 'Mon' },
    { id: 'm8', text: 'Can we reschedule?', senderId: '3', timestamp: 'Mon' },
  ],
};

const Messaging = () => {
  const theme = useTheme();
  const [conversations, setConversations] = React.useState(MOCK_CONVERSATIONS);
  const [messages, setMessages] = React.useState(MOCK_MESSAGES);
  const [selectedConversationId, setSelectedConversationId] = React.useState('1');

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const currentMessages = messages[selectedConversationId] || [];

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    // Clear unread when selecting - in real app, call API to mark as read
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      )
    );
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: `m${Date.now()}`,
      text: text.trim(),
      senderId: 'currentUser',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
    }));

    // Update last message in conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? { ...c, lastMessage: text.trim(), lastMessageAt: newMessage.timestamp, unread: 0 }
          : c
      )
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        minHeight: 400,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: 360,
          minWidth: 280,
          borderRight: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
        />
      </Paper>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: 'background.default',
        }}
      >
        {selectedConversation ? (
          <>
            <MessageList
              conversationName={selectedConversation.name}
              messages={currentMessages}
            />
            <MessageInput onSend={handleSendMessage} />
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            Select a conversation to start messaging
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Messaging;
