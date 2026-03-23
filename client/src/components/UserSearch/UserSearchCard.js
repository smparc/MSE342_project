import * as React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const TAG_LABELS = {
  program: 'Program',
  year: 'Year',
  country: 'Country',
  school: 'School',
  term: 'Term',
};

const UserSearchCard = ({ user, onClick }) => {
  const { username, display_name, tags = [] } = user;
  const displayName = display_name || username || 'Unknown';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': onClick
          ? {
              backgroundColor: 'action.hover',
              borderColor: 'primary.light',
            }
          : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
            flexShrink: 0,
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            @{username}
          </Typography>
          {tags.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
              {tags.map((t, i) => (
                <Chip
                  key={`${t.tag_type}-${t.tag_value}-${i}`}
                  label={`${TAG_LABELS[t.tag_type] || t.tag_type}: ${t.tag_value}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 500,
                    borderColor: 'divider',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default UserSearchCard;
