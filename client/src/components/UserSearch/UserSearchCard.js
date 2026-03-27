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
  default: { borderColor: 'divider', fontWeight: 500 },
};

const UserSearchCard = ({ user, onClick }) => {
  const {
    username,
    display_name,
    bio,
    faculty,
    program,
    grad_year,
    exchange_term,
    uw_verified,
    tags = [],
  } = user;
  const displayName = display_name || username || 'Unknown';

  const profileTags = [];
  if (uw_verified) profileTags.push(<Chip key="uwVerified" label="UW Verified" size="small" sx={CHIP_STYLES.uwVerified} />);
  if (faculty) profileTags.push(<Chip key="faculty" label={faculty} size="small" sx={CHIP_STYLES.faculty} />);
  if (program) profileTags.push(<Chip key="program" label={program} size="small" sx={CHIP_STYLES.program} />);
  if (grad_year) profileTags.push(<Chip key="gradYear" label={`Class of ${grad_year}`} size="small" sx={CHIP_STYLES.gradYear} />);
  if (exchange_term) profileTags.push(<Chip key="exchangeTerm" label={`${exchange_term} Exchange`} size="small" sx={CHIP_STYLES.exchangeTerm} />);

  const tagTypesShown = new Set(['program', 'year', 'exchange_term']);
  if (faculty) tagTypesShown.add('faculty');
  const extraTags = tags.filter((t) => !tagTypesShown.has(t.tag_type));
  extraTags.forEach((t) => {
    profileTags.push(
      <Chip
        key={`${t.tag_type}-${t.tag_value}`}
        label={`${TAG_LABELS[t.tag_type] || t.tag_type}: ${t.tag_value}`}
        size="small"
        variant="outlined"
        sx={CHIP_STYLES.default}
      />
    );
  });

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
          {profileTags.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
              {profileTags}
            </Stack>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default UserSearchCard;
