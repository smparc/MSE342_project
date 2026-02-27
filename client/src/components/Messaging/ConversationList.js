import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { formatMessageTimestamp } from './utils';

const ConversationList = ({ conversations, selectedId, onSelect }) => {
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
      <Box sx={{ py: 1.5, px: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h2">
          Messages
        </Typography>
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
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Box>
      <List disablePadding sx={{ flex: 1, overflow: 'auto' }}>
        {filteredConversations.map((conv) => {
          const isSelected = conv.id === selectedId;
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
              <Avatar
                sx={{
                  bgcolor: isSelected ? 'primary.main' : 'grey.400',
                  width: 48,
                  height: 48,
                  mr: 2,
                }}
              >
                {(conv.senderName || '?').charAt(0)}
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" noWrap>
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
