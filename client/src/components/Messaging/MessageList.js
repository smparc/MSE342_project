import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { formatDayHeader } from './utils';

const MessageList = ({ conversationName, messages, loading }) => {
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
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Typography variant="body2" color="text.secondary">Loading messages…</Typography>
        </Box>
      ) : (
      <List
        ref={messageListRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 2,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mt: 4 }}>
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          (() => {
            let lastDateKey = null;
            return messages.map((msg, index) => {
              const isOwn = msg.senderId === 'currentUser';
              const prevSameSender = index > 0 && messages[index - 1].senderId === msg.senderId;

              const createdAt = msg.createdAt;
              const dateObj = createdAt ? new Date(createdAt) : null;
              const dateKey = dateObj ? dateObj.toDateString() : null;
              const showHeader = dateKey && dateKey !== lastDateKey;
              if (showHeader) {
                lastDateKey = dateKey;
              }

              return (
                <React.Fragment key={msg.id}>
                  {showHeader && (
                    <ListItem
                      sx={{
                        justifyContent: 'center',
                        px: 0,
                        py: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 999,
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          textAlign: 'center',
                        }}
                      >
                        {formatDayHeader(createdAt)}
                      </Typography>
                    </ListItem>
                  )}
                  <ListItem
                    sx={{
                      justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      px: 0,
                      py: 0,
                      mt: prevSameSender && !showHeader ? 0.25 : 1,
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        maxWidth: 564,
                        px: 1.5, // 12px left/right
                        py: 1, // 8px top/bottom
                        backgroundColor: isOwn ? 'rgb(74, 93, 249)' : 'rgb(243, 245, 247)',
                        color: isOwn ? '#ffffff' : 'text.primary',
                        borderRadius: 18,
                        borderBottomRightRadius: isOwn ? 4 : 18,
                        borderBottomLeftRadius: isOwn ? 18 : 4,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: 15,
                          lineHeight: 1.4,
                        }}
                      >
                        {msg.text}
                      </Typography>
                    </Paper>
                  </ListItem>
                </React.Fragment>
              );
            });
          })()
        )}
      </List>
      )}
    </>
  );
};

export default MessageList;
