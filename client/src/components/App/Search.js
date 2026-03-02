import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';


const Search = () => {
  const [query, setQuery] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);



  React.useEffect(() => {
  });

  const handleSearch = async (searchTerm) => {
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
      <TextField
        fullWidth
        placeholder="Search by username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}

    </Box>
  );
};

export default Search;
