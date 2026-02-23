import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

const Profile = () => {
  return (
    <Box
      sx={{
        p: 3,
        pb: 10,
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 96, height: 96, mb: 2 }}>U</Avatar>
        <Typography variant="h6">User Profile</Typography>
        <Typography variant="body2" color="text.secondary">
          @username
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">0</Typography>
          <Typography variant="caption" color="text.secondary">Posts</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">0</Typography>
          <Typography variant="caption" color="text.secondary">Followers</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">0</Typography>
          <Typography variant="caption" color="text.secondary">Following</Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Profile content goes here. Add posts, bio, edit profile, etc.
      </Typography>
    </Box>
  );
};

export default Profile;
