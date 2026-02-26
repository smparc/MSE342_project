import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
const Search = () => {
  const [query, setQuery] = React.useState('');

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
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
      />
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
        Search results will appear here. Connect to your backend to load users, posts, etc.
      </Typography>
    </Box>
  );
};

export default Search;
