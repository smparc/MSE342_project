import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { formatMessageTimestamp } from './utils';

// Current user id - matches userId used for conversation list (replace with auth when available)
const CURRENT_USER_ID = 2;

const Messaging = () => {
  const theme = useTheme();
  const [conversations, setConversations] = React.useState([]);
  const [messages, setMessages] = React.useState({});
  const [selectedConversationId, setSelectedConversationId] = React.useState(null);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [listLoadError, setListLoadError] = React.useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const currentMessages = messages[selectedConversationId] || [];

  React.useEffect(() => {
    loadConversationList();
  }, []);

  React.useEffect(() => {
    if (selectedConversationId) {
      loadConversationMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  const loadConversationList = async () => {
    setListLoadError(false);
    try {
      const response = await fetch(`/api/messages-list?userId=${CURRENT_USER_ID}`);
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        setConversations([]);
        setListLoadError(true);
        return;
      }
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversation list:', error);
      setConversations([]);
      setListLoadError(true);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?userId=${CURRENT_USER_ID}`
      );
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        setMessages((prev) => ({ ...prev, [conversationId]: [] }));
        return;
      }
      const mapped = data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        senderId: String(msg.senderId) === String(CURRENT_USER_ID) ? 'currentUser' : String(msg.senderId),
        timestamp: formatMessageTimestamp(msg.created_at),
      }));
      setMessages((prev) => ({ ...prev, [conversationId]: mapped }));
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages((prev) => ({ ...prev, [conversationId]: [] }));
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
    );
  };

  const handleSendMessage = async (text) => {
    const content = text.trim();
    if (!content || !selectedConversationId) return;

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversationId}/messages?userId=${CURRENT_USER_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to send message:', data);
        return;
      }

      const newMessage = {
        id: data.id,
        text: data.content,
        senderId: String(data.senderId) === String(CURRENT_USER_ID) ? 'currentUser' : String(data.senderId),
        timestamp: formatMessageTimestamp(data.created_at),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId
            ? { ...c, lastMessage: content, lastMessageAt: newMessage.timestamp, unread: 0 }
            : c
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (listLoadError) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 56px)',
          minHeight: 400,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
          p: 3,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Messages failed to load. Please try again later.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 56px)', // Account for bottom nav bar
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
              conversationName={selectedConversation.senderName || selectedConversation.name || 'Unknown'}
              messages={currentMessages}
              loading={messagesLoading}
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
