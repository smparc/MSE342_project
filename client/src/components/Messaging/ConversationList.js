import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
const ConversationList = ({ conversations, selectedId, onSelect }) => {
  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h2">
          Messages
        </Typography>
      </Box>
      <List disablePadding>
        {conversations.map((conv) => {
          const isSelected = conv.id === selectedId;
          return (
            <ListItemButton
              key={conv.id}
              selected={isSelected}
              onClick={() => onSelect(conv.id)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <Badge
                badgeContent={conv.unread}
                color="primary"
                invisible={conv.unread === 0}
                sx={{ mr: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: isSelected ? 'primary.main' : 'grey.400',
                    width: 48,
                    height: 48,
                  }}
                >
                  {conv.name.charAt(0)}
                </Avatar>
              </Badge>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={conv.unread > 0 ? 600 : 400}
                      noWrap
                    >
                      {conv.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conv.lastMessageAt}
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
