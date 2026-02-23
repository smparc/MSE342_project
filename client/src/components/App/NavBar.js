import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

const navItems = [
  { value: '/profile', label: 'Profile' },
  { value: '/search', label: 'Search' },
  { value: '/messages', label: 'Messages' },
];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentValue = React.useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/profile') return '/profile';
    if (path === '/search') return '/search';
    if (path === '/messages') return '/messages';
    return path;
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <BottomNavigation value={currentValue} onChange={handleChange} showLabels>
        {navItems.map((item) => (
          <BottomNavigationAction key={item.value} value={item.value} label={item.label} />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default NavBar;
