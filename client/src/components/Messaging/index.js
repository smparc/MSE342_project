import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { formatMessageTimestamp } from './utils';
import { FirebaseContext, authFetch } from '../Firebase';

const sortConversationsByLastActive = (list) => {
  return [...list].sort((a, b) => {
    const timeA = new Date(a.lastMessageAt || 0).getTime();
    const timeB = new Date(b.lastMessageAt || 0).getTime();
    return timeB - timeA; // most recent first
  });
};

const Messaging = ({ currentUser, authUser }) => {
  const theme = useTheme();
  const firebase = React.useContext(FirebaseContext);
  
  // Use authenticated user's identifier
  const CURRENT_USERNAME = currentUser || authUser?.email?.split('@')[0] || 'elly';
  const [conversations, setConversations] = React.useState([]);
  const [messages, setMessages] = React.useState({});
  const [selectedConversationId, setSelectedConversationId] = React.useState(null);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [listLoadError, setListLoadError] = React.useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const currentMessages = messages[selectedConversationId] || [];

  const loadConversationList = React.useCallback(async () => {
    setListLoadError(false);
    try {
      const response = await fetch(`/api/messages-list?username=${encodeURIComponent(CURRENT_USERNAME)}`);
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        setConversations([]);
        setListLoadError(true);
        return;
      }
      setConversations(sortConversationsByLastActive(data));
    } catch (error) {
      //console.error('Error loading conversation list:', error);
      setConversations([]);
      setListLoadError(true);
    }
  }, []);

  const loadConversationMessages = React.useCallback(async (conversationId) => {
    if (conversationId == null || conversationId === '') {
      return;
    }
    setMessagesLoading(true);
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?username=${encodeURIComponent(CURRENT_USERNAME)}`
      );
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        setMessages((prev) => ({ ...prev, [conversationId]: [] }));
        return;
      }
      const mapped = data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        senderId: msg.senderId === CURRENT_USERNAME ? 'currentUser' : String(msg.senderId),
        timestamp: formatMessageTimestamp(msg.created_at),
        createdAt: msg.created_at,
      }));
      setMessages((prev) => ({ ...prev, [conversationId]: mapped }));
      loadConversationList();
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages((prev) => ({ ...prev, [conversationId]: [] }));
    } finally {
      setMessagesLoading(false);
    }
  }, [loadConversationList]);

  React.useEffect(() => {
    loadConversationList();
  }, [loadConversationList]);

  React.useEffect(() => {
    if (selectedConversationId) {
      loadConversationMessages(selectedConversationId);
    }
  }, [selectedConversationId, loadConversationMessages]);

  React.useEffect(() => {
    const interval = setInterval(loadConversationList, 30000);
    return () => clearInterval(interval);
  }, [loadConversationList]);

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
      const response = await authFetch(
        `/api/conversations/${selectedConversationId}/messages?username=${encodeURIComponent(CURRENT_USERNAME)}`,
        {
          method: 'POST',
          body: JSON.stringify({ content }),
        },
        firebase
      );
      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to send message:', data);
        return;
      }

      const newMessage = {
        id: data.id,
        text: data.content,
        senderId: data.senderId === CURRENT_USERNAME ? 'currentUser' : String(data.senderId),
        timestamp: formatMessageTimestamp(data.created_at),
        createdAt: data.created_at,
      };

      setMessages((prev) => ({
        ...prev,
        [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
      }));

      setConversations((prev) =>
        sortConversationsByLastActive(
          prev.map((c) =>
            c.id === selectedConversationId
              ? { ...c, lastMessage: content, lastMessageAt: data.created_at, unread: 0 }
              : c
          )
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
          height: '100vh',
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
        height: '100vh',
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
