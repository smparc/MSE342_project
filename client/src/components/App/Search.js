import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import {
  UserSearchCard,
  UserProfileModal,
  SearchFiltersBar,
  emptyFilters,
  useUserSearch,
} from '../UserSearch';
import { FirebaseContext, authFetch } from '../Firebase';
import '../CourseSearch/CourseSearch.css';

const Search = ({ currentUser, authUser }) => {
  const firebase = React.useContext(FirebaseContext);
  const currentUsername = currentUser || authUser?.email?.split('@')[0] || '';
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ ...emptyFilters });
  const [selectedUser, setSelectedUser] = React.useState(null);

  const { users, loading, error, searchUsers } = useUserSearch({
    currentUsername,
    searchQuery,
    includeTags: true,
    excludeConversations: false,
    enabled: true,
    fetchAllWhenEmpty: true,
    facultyFilter: filters.faculty,
    gradYearFilter: filters.gradYear,
    exchangeTermFilter: filters.exchangeTerm,
    exchangeCountryFilter: filters.exchangeCountry,
    exchangeSchoolFilter: filters.exchangeSchool,
  });

  React.useEffect(() => {
    const debounceMs = searchQuery.trim() ? 300 : 0;
    const timer = setTimeout(searchUsers, debounceMs);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    filters.faculty,
    filters.gradYear,
    filters.exchangeTerm,
    filters.exchangeCountry,
    filters.exchangeSchool,
    searchUsers,
  ]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <Box
      className="cs-wrap"
      sx={{
        pb: 6,
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontSize: '2rem' }}>
        Search Users
      </Typography>
      <div className="cs-search-row">
        <TextField
          fullWidth
          placeholder="Search by name, username, or program…"
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
        />
      </div>

      <SearchFiltersBar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({ ...emptyFilters })}
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

      {!loading && users.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 6 }}>
          No users match your criteria.
        </Typography>
      )}

      {!loading && users.length > 0 && (
        <Grid container spacing={2}>
          {users.map((user) => (
            <Grid item xs={12} key={user.username}>
              <UserSearchCard user={user} onClick={() => handleUserClick(user)} />
            </Grid>
          ))}
        </Grid>
      )}
      <UserProfileModal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        currentUsername={currentUsername}
        authFetch={authFetch}
        firebase={firebase}
      />
    </Box>
  );
};

export default Search;
