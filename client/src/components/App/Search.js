import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { UserSearchCard, useUserSearch } from '../UserSearch';

const Search = ({ currentUser, authUser }) => {
  const navigate = useNavigate();
  const currentUsername = currentUser || authUser?.email?.split('@')[0] || '';
  const [searchQuery, setSearchQuery] = React.useState('');

  const { users, loading, error, searchUsers } = useUserSearch({
    currentUsername,
    searchQuery,
    includeTags: true,
    excludeConversations: false,
    enabled: true,
  });

  React.useEffect(() => {
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <Box
      sx={{
        p: 3,
        pb: 10,
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Search Users
      </Typography>
      <TextField
        fullWidth
        placeholder="Search by username or display name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {!loading && searchQuery.trim() && users.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 6 }}>
          No users match &quot;{searchQuery}&quot;
        </Typography>
      )}

      {!loading && !searchQuery.trim() && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 6 }}>
          Type to search for users
        </Typography>
      )}

      {!loading && users.length > 0 && (
        <Grid container spacing={2}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.username}>
              <UserSearchCard user={user} onClick={() => handleUserClick(user.username)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Search;
