import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useUserSearch } from '../UserSearch';

const CreateMessage = ({ open, onClose, currentUsername, authFetch, firebase, onConversationCreated }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [starting, setStarting] = React.useState(null);
  const [conversationError, setConversationError] = React.useState('');

  const { users, loading: searching, error: searchError, searchUsers } = useUserSearch({
    currentUsername,
    searchQuery,
    includeTags: false,
    excludeConversations: false,
    enabled: open && !!currentUsername,
    fetchAllWhenEmpty: true,
  });

  React.useEffect(() => {
    if (open) {
      setSearchQuery('');
      setStarting(null);
      setConversationError('');
    }
  }, [open]);

  React.useEffect(() => {
    if (!open || !currentUsername) return;
    const debounceMs = searchQuery.trim() ? 300 : 0;
    const timer = setTimeout(searchUsers, debounceMs);
    return () => clearTimeout(timer);
  }, [open, currentUsername, searchQuery, searchUsers]);

  const handleStartConversation = async (targetUser) => {
    if (!currentUsername || !authFetch || !firebase) return;
    setStarting(targetUser.username);
    setConversationError('');
    try {
      const response = await authFetch(
        `/api/conversations?username=${encodeURIComponent(currentUsername)}`,
        {
          method: 'POST',
          body: JSON.stringify({ targetUsername: targetUser.username }),
        },
        firebase
      );
      const data = await response.json();
      if (!response.ok) {
        setConversationError(data.error || 'Failed to start conversation');
        return;
      }
      onConversationCreated &&
        onConversationCreated({
          id: data.id,
          senderName: data.senderName,
        });
      onClose();
    } catch (err) {
      console.error('Error starting conversation:', err);
      setConversationError('Failed to start conversation');
    } finally {
      setStarting(null);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setConversationError('');
    setStarting(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle>New message</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, username, or program…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            mt: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'tertiary.light',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'tertiary.main',
              },
              '&.Mui-focused': {
                backgroundColor: 'tertiary.light',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'tertiary.main',
                borderWidth: 2,
              },
            },
          }}
        />
        {(searchError || conversationError) && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {conversationError || searchError}
          </Typography>
        )}
        <Box sx={{ minHeight: 200 }}>
          {searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : users.length === 0 ? (
            <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>
              {searchQuery.trim()
                ? 'No users match your search'
                : 'No other users found'}
            </Typography>
          ) : (
            <List disablePadding>
              {users.map((user) => (
                <ListItemButton
                  key={user.username}
                  onClick={() => handleStartConversation(user)}
                  disabled={starting === user.username}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'grey.400' }}>
                      {(user.display_name || user.username || '?').charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.display_name || user.username}
                    secondary={user.display_name ? user.username : null}
                  />
                  {starting === user.username && (
                    <CircularProgress size={20} sx={{ ml: 1 }} />
                  )}
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMessage;
