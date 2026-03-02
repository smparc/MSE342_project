import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Search = () => {
  const [query, setQuery] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);



  React.useEffect(() => {
  });

  const handleSearch = async (searchTerm) => {
    setLoading(true);
    setSearched(true);
  
    try {
      // Get user profile by username (MUST BE EXACT USERNAME)
      const userRes = await fetch(`/api/user/${encodeURIComponent(searchTerm)}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData || null);
      } else {
        setUser(null);
      }

      // Get all posts by the username
      const postsRes = await fetch(`/api/posts/${encodeURIComponent(searchTerm)}`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData || []);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setUser(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        pb: 10,
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Search
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Search
        </Button>

      </Box>

    </Box>
  );
};

export default Search;
