import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = React.useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.default',
              borderRadius: 18,
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!message.trim()}
          sx={{ flexShrink: 0, minWidth: 80, height: 40, borderRadius: 18 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default MessageInput;
