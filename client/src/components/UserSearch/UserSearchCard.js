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

/** Chip styles matching ProfileHeader */
const CHIP_STYLES = {
  uwVerified: { bgcolor: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', fontWeight: '500' },
  faculty: { bgcolor: '#FFF9C4', color: '#827717', border: '1px solid #FFF176', fontWeight: '500' },
  program: { bgcolor: '#FCE4EC', color: '#C2185B', border: '1px solid #F8BBD0', fontWeight: '500' },
  gradYear: { bgcolor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2', fontWeight: '500' },
  exchangeTerm: { bgcolor: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB', fontWeight: '500' },
  exchangeCountry: { bgcolor: '#E0F2F1', color: '#00695C', border: '1px solid #80CBC4', fontWeight: '500' },
  exchangeSchool: { bgcolor: '#F3E5F5', color: '#6A1B9A', border: '1px solid #CE93D8', fontWeight: '500' },
  default: { borderColor: 'divider', fontWeight: 500 },
};

const tagValue = (tags, type) => tags.find((t) => t.tag_type === type)?.tag_value;

const UserSearchCard = ({ user, onClick }) => {
  const {
    username,
    display_name,
    bio,
    faculty,
    program,
    grad_year,
    exchange_term,
    destination_country,
    destination_school,
    uw_verified,
    tags = [],
  } = user;
  const displayName = display_name || username || 'Unknown';

  const exchangeTermDisplay =
    exchange_term || tagValue(tags, 'term') || tagValue(tags, 'exchange_term');
  const exchangeCountry =
    destination_country || tagValue(tags, 'country');
  const exchangeSchool =
    destination_school || tagValue(tags, 'school');

  const group1 = [];
  if (faculty) {
    group1.push(<Chip key="faculty" label={faculty} size="small" sx={CHIP_STYLES.faculty} />);
  }
  if (program) {
    group1.push(<Chip key="program" label={program} size="small" sx={CHIP_STYLES.program} />);
  }
  if (grad_year) {
    group1.push(
      <Chip key="gradYear" label={`Class of ${grad_year}`} size="small" sx={CHIP_STYLES.gradYear} />
    );
  }

  const group2 = [];
  if (exchangeTermDisplay) {
    group2.push(
      <Chip
        key="exchangeTerm"
        label={`${exchangeTermDisplay} Exchange`}
        size="small"
        sx={CHIP_STYLES.exchangeTerm}
      />
    );
  }
  if (exchangeCountry) {
    group2.push(
      <Chip key="exchangeCountry" label={exchangeCountry} size="small" sx={CHIP_STYLES.exchangeCountry} />
    );
  }
  if (exchangeSchool) {
    group2.push(
      <Chip key="exchangeSchool" label={exchangeSchool} size="small" sx={CHIP_STYLES.exchangeSchool} />
    );
  }

  const tagTypesHandled = new Set([
    'program',
    'year',
    'country',
    'school',
    'term',
    'exchange_term',
  ]);
  if (faculty) tagTypesHandled.add('faculty');

  const extraTags = tags.filter((t) => !tagTypesHandled.has(t.tag_type));
  const extraChips = extraTags.map((t) => (
    <Chip
      key={`${t.tag_type}-${t.tag_value}`}
      label={`${TAG_LABELS[t.tag_type] || t.tag_type}: ${t.tag_value}`}
      size="small"
      variant="outlined"
      sx={CHIP_STYLES.default}
    />
  ));

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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            @{username}
          </Typography>
          {bio && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
              {bio}
            </Typography>
          )}
          {(uw_verified || group1.length > 0 || group2.length > 0 || extraChips.length > 0) && (
            <Stack
              direction="row"
              flexWrap="nowrap"
              gap={0.5}
              useFlexGap
              alignItems="center"
              sx={{
                overflowX: 'auto',
                overflowY: 'hidden',
                maxWidth: '100%',
                py: 0,
                '& .MuiChip-root': { flexShrink: 0 },
              }}
            >
              {uw_verified && (
                <Chip
                  key="uwVerified"
                  label="UW Verified"
                  size="small"
                  sx={CHIP_STYLES.uwVerified}
                />
              )}
              {group1}
              {group2}
              {extraChips}
            </Stack>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default UserSearchCard;
