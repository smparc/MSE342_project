import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { formatMessageTimestamp } from './utils';

const ConversationList = ({ conversations, selectedId, onSelect, onNewMessage }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) =>
      (conv.senderName || '').toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  return (
    <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="h2">
          Messages
        </Typography>
        <IconButton
          onClick={onNewMessage}
          aria-label="Create or write new message"
          size="small"
          color="primary"
          sx={{ ml: 0.5 }}
        >
          <AddCommentIcon />
        </IconButton>
      </Box>
      <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'tertiary.light',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'tertiary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'tertiary.main',
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>
      <List disablePadding sx={{ flex: 1, overflow: 'auto' }}>
        {filteredConversations.map((conv) => {
          const isSelected = conv.id === selectedId;
          const hasUnread = (conv.unread || 0) > 0;
          return (
            <ListItemButton
              key={conv.id}
              selected={isSelected}
              onClick={() => onSelect(conv.id)}
              sx={{
                borderBottom: 1,
                borderColor: 'white',
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <Badge
                badgeContent={hasUnread ? (conv.unread > 99 ? '99+' : conv.unread) : 0}
                color="error"
                invisible={!hasUnread}
                sx={{ mr: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: isSelected ? 'primary.main' : 'grey.400',
                    width: 48,
                    height: 48,
                  }}
                >
                  {(conv.senderName || '?').charAt(0)}
                </Avatar>
              </Badge>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{ fontWeight: hasUnread ? 600 : 400 }}
                    >
                      {conv.senderName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatMessageTimestamp(conv.lastMessageAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {conv.lastMessage}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default ConversationList;
