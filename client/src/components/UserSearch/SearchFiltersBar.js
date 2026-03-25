import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FACULTIES } from '../../data/facultyPrograms';

const GRAD_YEARS = [];
const y = new Date().getFullYear();
for (let i = y - 2; i <= y + 8; i += 1) GRAD_YEARS.push(i);

/**
 * Filter row for user search: faculty, program, class year, exchange term (matches users columns + profile_tags).
 */
const SearchFiltersBar = ({ filters, onChange, onClear }) => {
  const setField = (field) => (e) => {
    const v = e.target.value;
    onChange({ ...filters, [field]: typeof v === 'string' ? v : String(v) });
  };

  const hasAny =
    !!filters.faculty || !!filters.program || !!filters.gradYear || !!filters.exchangeTerm;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Filter by profile & tags
      </Typography>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="search-filter-faculty">Faculty</InputLabel>
            <Select
              labelId="search-filter-faculty"
              label="Faculty"
              value={filters.faculty}
              onChange={setField('faculty')}
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {FACULTIES.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Program"
            placeholder="Contains…"
            value={filters.program}
            onChange={setField('program')}
            helperText="Matches profile or program tag"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="search-filter-class">Class (grad year)</InputLabel>
            <Select
              labelId="search-filter-class"
              label="Class (grad year)"
              value={filters.gradYear}
              onChange={setField('gradYear')}
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {GRAD_YEARS.map((year) => (
                <MenuItem key={year} value={String(year)}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Exchange term"
            placeholder="e.g. Fall 2025"
            value={filters.exchangeTerm}
            onChange={setField('exchangeTerm')}
            helperText="Matches profile or term tag"
          />
        </Grid>
        <Grid item xs={12}>
          <Button size="small" variant="text" onClick={onClear} disabled={!hasAny}>
            Clear filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchFiltersBar;
