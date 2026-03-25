import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { FirebaseContext } from '../Firebase';
import TimelineIcon from '@mui/icons-material/CalendarToday';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket'
import { DeleteForever, Settings } from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const NAV_WIDTH_COLLAPSED = 72;
const NAV_WIDTH_EXPANDED = 240;

// <Route path="/advisors" element={<AdvisorsList />} />

const navItems = [
  { path: '/messages', label: 'Messages', icon: ChatIcon, testId: 'ChatIcon' },
  { path: '/search', label: 'Search', icon: SearchIcon, testId: 'SearchIcon' },
  { path: '/course-equivalency', label: 'Course Equivalency', icon: MenuBookIcon, testId: 'MenuBookIcon' },
  { path: '/timeline', label: 'Timeline', icon: TimelineIcon, testId: 'TimelineIcon' },
  { path: '/calendar', label: 'Calendar', icon: CalendarMonthIcon, testId: 'CalendarIcon' },
  { path: '/contacts', label: 'Contacts', icon: PersonIcon },
  { path: '/advisors', label: 'Advisors', icon: PersonIcon },
  { path: '/profile', label: 'Profile', icon: PersonIcon },
  { path: '/settings/delete-account', label: 'Delete', icon: DeleteForever },
  { path: '/settings/user-type', label: 'Settings', icon: Settings }
];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const firebase = React.useContext(FirebaseContext);
  const [expanded, setExpanded] = React.useState(false);

  const currentPath = location.pathname;
  const isActive = (path) =>
    currentPath === path ||
    (path === '/profile' && currentPath === '/') ||
    (path === '/course-equivalency' && currentPath.startsWith('/course-equivalency'));

  const handleSignOut = () => {
    firebase.doSignOut().then(() => {
      navigate('/');
    });
  };

  return (
    <Box
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: expanded ? NAV_WIDTH_EXPANDED : NAV_WIDTH_COLLAPSED,
        zIndex: 1100,
        borderRight: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        transition: 'width 0.2s ease-in-out',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 56,
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            minWidth: expanded ? 56 : 0,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <AirplaneTicketIcon fontSize="medium" sx={{ color: 'primary.main' }} />
        </Box>
        {expanded && (
          <Typography variant="h6" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
            WatExchange
          </Typography>
        )}
      </Box>
      <List disablePadding sx={{ pt: 2, flex: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              {...(item.testId && { 'data-testid': item.testId })}
              sx={{
                py: 1.5,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: expanded ? 'flex-start' : 'center',
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: expanded ? 56 : 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Icon fontSize="medium" />
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary={<Typography variant="body1">{item.label}</Typography>}
                  primaryTypographyProps={{ noWrap: true }}
                  sx={{ py: 0, my: 0 }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <List disablePadding sx={{ pb: 2 }}>
        <ListItemButton
          onClick={handleSignOut}
          sx={{
            py: 1.5,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: expanded ? 56 : 0,
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              color: 'inherit',
            }}
          >
            <LogoutIcon fontSize="medium" />
          </ListItemIcon>
          {expanded && (
            <ListItemText
              primary={<Typography variant="body1">Sign Out</Typography>}
              primaryTypographyProps={{ noWrap: true }}
              sx={{ py: 0, my: 0 }}
            />
          )}
        </ListItemButton>
      </List>
    </Box>
  );
};

export default NavBar;
export { NAV_WIDTH_COLLAPSED };
