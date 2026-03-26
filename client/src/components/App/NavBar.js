import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { FirebaseContext } from '../Firebase';
import TimelineIcon from '@mui/icons-material/CalendarToday';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket'
import { DeleteForever, Settings } from '@mui/icons-material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonth';
import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined';

import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'



const NAV_WIDTH_COLLAPSED = 72;
const NAV_WIDTH_EXPANDED = 240;

// <Route path="/advisors" element={<AdvisorsList />} />

const navItems = [
  { path: '/messages', label: 'Messages', icon: ChatIcon, testId: 'ChatIcon' },
  { path: '/search', label: 'Search', icon: SearchIcon, testId: 'SearchIcon' },
  { path: '/course-equivalency', label: 'Course Equivalency', icon: MenuBookIcon, testId: 'MenuBookIcon' },
  { path: '/timeline', label: 'Timeline', icon: TimelineIcon, testId: 'TimelineIcon' },
  { path: '/calendar', label: 'Calendar', icon: CalendarMonthOutlinedIcon, testId: 'CalendarIcon' },
  { path: '/contacts', label: 'Contacts', icon: ContactPageOutlinedIcon },
  { path: '/advisors', label: 'Advisors', icon: ContactPageOutlinedIcon },
  // { path: '/profile', label: 'Profile', icon: PersonIcon },
  // { path: '/settings/delete-account', label: 'Delete', icon: DeleteForever },
  // { path: '/settings/user-type', label: 'Settings', icon: Settings }
];

const NavBar = ({ currentUser, authUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const firebase = React.useContext(FirebaseContext);
  const [expanded, setExpanded] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const username = currentUser || authUser?.email?.split('@')[0];

  React.useEffect(() => {
    if (!username) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/messages-unread-count?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (res.ok && data.count != null) setUnreadCount(data.count);
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    const onRead = () => fetchUnread();
    window.addEventListener('messages-read', onRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener('messages-read', onRead);
    };
  }, [username]);

  const [settingsAnchor, setSettingsAnchor] = React.useState(null)
  const openSettings = Boolean(settingsAnchor)

  const handleSettingsClick = (event) => {
    setSettingsAnchor(event.currentTarget)
  }

  const handleSettingsClose = () => {
    setSettingsAnchor(null)
  }

  const handleNavigateSettings = (path) => {
    navigate(path)
    handleSettingsClose()
  }


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
          <AirplaneTicketIcon fontSize="medium" sx={{ color: 'text.primary' }} />
        </Box>
        {expanded && (
          <Typography variant="h6" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
            WatExchange
          </Typography>
        )}
      </Box>
      {/* <List disablePadding sx={{ pt: 2, flex: 1 }}> */}
      {/* AI used to help with centering */}
      <List disablePadding sx={{ my: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          const showUnreadBadge = item.path === '/messages' && unreadCount > 0;
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
                  '& .MuiListItemIcon-root': {
                    color: 'text.primary',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: expanded ? 56 : 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  color: 'text.primary',
                }}
              >
                {showUnreadBadge ? (
                  <Badge badgeContent={unreadCount > 99 ? '99+' : unreadCount} color="error">
                    <Icon fontSize="medium" sx={{ color: 'inherit' }} />
                  </Badge>
                ) : (
                  <Icon fontSize="medium" />
                )}
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

      {/* Divider between 2 big units */}
      {/* TODO: move profile below and change it to avatar */}
      <Divider />

        <List disablePadding sx={{ pb: 2 }}>
        <ListItemButton
          // onClick={handleSignOut}
          onClick={() => navigate('/profile')}
          sx={{
            py: 1.5,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            // color: 'error.main',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover'
              // backgroundColor: 'error.light',
              // color: 'error.contrastText',
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
            {/* <LogoutIcon fontSize="medium" /> */}
            <AccountCircleOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          {expanded && (  
            <ListItemText
              // primary={<Typography variant="body1">Sign Out</Typography>}
              primary={<Typography variant="body1">Profile</Typography>}
              primaryTypographyProps={{ noWrap: true }}
              sx={{ py: 0, my: 0 }}
            />
          )}
        </ListItemButton>
      </List>


      <List disablePadding sx={{ pb: 2 }}>
        <ListItemButton
          // onClick={handleSignOut}
          onClick={handleSettingsClick}
          sx={{
            py: 1.5,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            // color: 'error.main',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover'
              // backgroundColor: 'error.light',
              // color: 'error.contrastText',
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
            {/* <LogoutIcon fontSize="medium" /> */}
            <Settings fontSize="medium" />
          </ListItemIcon>
          {expanded && (  
            <ListItemText
              // primary={<Typography variant="body1">Sign Out</Typography>}
              primary={<Typography variant="body1">More</Typography>}
              primaryTypographyProps={{ noWrap: true }}
              sx={{ py: 0, my: 0 }}
            />
          )}
        </ListItemButton>
      </List>
      
      <Menu
        anchorEl={settingsAnchor}
        open={openSettings}
        onClose={handleSettingsClose}
        onClick={handleSettingsClose}
        disableScrollLock={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: -1,
            ml: 2,
            minWidth: 200,
            borderRadius: 3,
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            },
          },
        }}
      >
        <MenuItem onClick={() => handleNavigateSettings('/profile')}>
          <ListItemIcon>
            <AccountCircleOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleNavigateSettings('/settings/user-type')}>
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: 'text.secondary' }} />
          </ListItemIcon>
          <ListItemText>User Settings</ListItemText>
        </MenuItem>



        <Divider sx={{ my: 1, mx: 2 }} />

        <MenuItem onClick={() => { handleSettingsClose(); handleSignOut(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleNavigateSettings('/settings/delete-account')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteForever fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete Account</ListItemText>
        </MenuItem>

      </Menu>


    </Box>
  );
};

export default NavBar;
export { NAV_WIDTH_COLLAPSED };
