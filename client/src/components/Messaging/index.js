import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CreateMessage from './CreateMessage';
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
  const location = useLocation();
  const navigate = useNavigate();

  // Use authenticated user's identifier
  const CURRENT_USERNAME = currentUser || authUser?.email?.split('@')[0] || 'elly';
  const [conversations, setConversations] = React.useState([]);
  const [messages, setMessages] = React.useState({});
  const [selectedConversationId, setSelectedConversationId] = React.useState(null);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [listLoadError, setListLoadError] = React.useState(false);
  const [newMessageModalOpen, setNewMessageModalOpen] = React.useState(false);

  /** Conversations created via "New message" that have not had a message sent yet */
  const ephemeralConversationIdsRef = React.useRef(new Set());
  /** Empty conversations the user navigated away from — hidden until they have a lastMessage from server */
  const dismissedEmptyConversationIdsRef = React.useRef(new Set());

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
      const filtered = data.filter((c) => {
        const empty = !c.lastMessage || !String(c.lastMessage).trim();
        if (dismissedEmptyConversationIdsRef.current.has(String(c.id)) && empty) return false;
        return true;
      });
      setConversations(sortConversationsByLastActive(filtered));
    } catch (error) {
      //console.error('Error loading conversation list:', error);
      setConversations([]);
      setListLoadError(true);
    }
  }, [CURRENT_USERNAME]);

  const loadConversationMessages = React.useCallback(async (conversationId) => {
    if (conversationId == null || conversationId === '') {
      return;
    }
    setMessagesLoading(true);
    try {
      const readRes = await fetch(
        `/api/conversations/${conversationId}/read?username=${encodeURIComponent(CURRENT_USERNAME)}`,
        { method: 'PUT' }
      );
      if (readRes.ok) {
        window.dispatchEvent(new CustomEvent('messages-read'));
      }
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
  }, [loadConversationList, CURRENT_USERNAME]);

  React.useEffect(() => {
    loadConversationList();
  }, [loadConversationList]);

  const openConversationState = location.state?.openConversationId
    ? { id: location.state.openConversationId, senderName: location.state.senderName }
    : null;
  React.useEffect(() => {
    if (!openConversationState) return;
    const { id, senderName } = openConversationState;
    setConversations((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev;
      return sortConversationsByLastActive([
        { id, senderName: senderName || 'Unknown', lastMessage: '', lastMessageAt: null, unread: 0 },
        ...prev,
      ]);
    });
    setSelectedConversationId(id);
    navigate('/messages', { replace: true, state: {} });
  }, [openConversationState?.id, navigate]);

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
    const prevId = selectedConversationId;
    const prevKey = prevId != null ? String(prevId) : '';
    const nextKey = String(conversationId);
    const shouldDropEmptyPrev =
      Boolean(prevKey) &&
      prevKey !== nextKey &&
      ephemeralConversationIdsRef.current.has(prevKey);

    if (shouldDropEmptyPrev) {
      ephemeralConversationIdsRef.current.delete(prevKey);
      dismissedEmptyConversationIdsRef.current.add(prevKey);
      setMessages((m) => {
        const next = { ...m };
        delete next[prevId];
        delete next[prevKey];
        return next;
      });
    }

    setSelectedConversationId(conversationId);
    setConversations((prev) => {
      const list = shouldDropEmptyPrev ? prev.filter((c) => String(c.id) !== prevKey) : prev;
      return list.map((c) =>
        String(c.id) === nextKey ? { ...c, unread: 0 } : c
      );
    });
  };

  const handleConversationCreated = (newConv) => {
    const existing = conversations.find((c) => c.id === newConv.id);
    if (!existing) {
      ephemeralConversationIdsRef.current.add(String(newConv.id));
      setConversations((prev) =>
        sortConversationsByLastActive([
          {
            id: newConv.id,
            senderName: newConv.senderName,
            lastMessage: '',
            lastMessageAt: null,
            unread: 0,
          },
          ...prev,
        ])
      );
    }
    setSelectedConversationId(newConv.id);
    setNewMessageModalOpen(false);
    loadConversationMessages(newConv.id);
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

      const convKey = String(selectedConversationId);
      ephemeralConversationIdsRef.current.delete(convKey);
      dismissedEmptyConversationIdsRef.current.delete(convKey);

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
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.default,
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
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.default,
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
          onNewMessage={() => setNewMessageModalOpen(true)}
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
            Select a conversation to start messaging.
          </Box>
        )}
      </Paper>
      <CreateMessage
        open={newMessageModalOpen}
        onClose={() => setNewMessageModalOpen(false)}
        currentUsername={CURRENT_USERNAME}
        authFetch={authFetch}
        firebase={firebase}
        onConversationCreated={handleConversationCreated}
      />
    </Box>
  );
};

export default Messaging;
