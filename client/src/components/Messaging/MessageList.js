import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const MessageList = ({ conversationName, messages }) => {
  const messageListRef = React.useRef(null);

  React.useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Box
        sx={{
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6" component="h2">
          {conversationName}
        </Typography>
      </Box>
      <List
        ref={messageListRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 2,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mt: 4 }}>
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === 'currentUser';
            return (
              <ListItem
                key={msg.id}
                sx={{
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  px: 0,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: '75%',
                    px: 2,
                    py: 1.25,
                    backgroundColor: isOwn ? 'primary.main' : 'action.hover',
                    color: isOwn ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                    borderTopRightRadius: isOwn ? 0 : 2,
                    borderTopLeftRadius: isOwn ? 2 : 0,
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.85,
                    }}
                  >
                    {msg.timestamp}
                  </Typography>
                </Paper>
              </ListItem>
            );
          })
        )}
      </List>
    </>
  );
};

export default MessageList;
