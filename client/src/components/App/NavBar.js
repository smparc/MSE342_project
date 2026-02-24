import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';

const NAV_WIDTH_COLLAPSED = 72;
const NAV_WIDTH_EXPANDED = 220;

const navItems = [
  { path: '/messages', label: 'Messages', icon: ChatIcon },
  { path: '/search', label: 'Search', icon: SearchIcon },
  { path: '/course-equivalency', label: 'Course Equivalency', icon: MenuBookIcon },
  { path: '/profile', label: 'Profile', icon: PersonIcon },
];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = React.useState(false);

  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path || (path === '/profile' && currentPath === '/');

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
      }}
    >
      <List disablePadding sx={{ pt: 2 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                py: 1.5,
                px: 2,
                justifyContent: expanded ? 'flex-start' : 'center',
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: expanded ? 56 : 0, justifyContent: 'center' }}>
                <Icon fontSize="medium" />
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary={<Typography variant="body1">{item.label}</Typography>}
                  primaryTypographyProps={{ noWrap: true }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default NavBar;
export { NAV_WIDTH_COLLAPSED };
