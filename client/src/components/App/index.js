import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import NavBar, { NAV_WIDTH_COLLAPSED } from './NavBar';
import Profile from '../Profile';
import Search from './Search';
import CourseSearch from '../CourseSearch';
import CourseSubmit from '../CourseSubmit';
import Messaging from '../Messaging';
import Timeline from '../Timeline';
import ContactsList from '../ContactsList';
import AdvisorsList from '../AdvisorsList';
import DeleteAccount from '../DeleteAccount';
import UserTypeSelect from '../UserTypeSelect';
import SignOut from '../SignOut';

// Replace with auth context when available
const CURRENT_USER = 'elly';

const MainLayout = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: 'background.default',
      pl: `${NAV_WIDTH_COLLAPSED}px`,
    }}
  >
    {children}
  </Box>
);

const App = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <MainLayout>
        <Routes>
          {/* Existing Sprint 1 routes */}
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/messages" element={<Messaging />} />
          <Route path="/search" element={<Search />} />
          <Route path="/course-equivalency/submit" element={<CourseSubmit currentUser={CURRENT_USER} />} />
          <Route path="/course-equivalency" element={<CourseSearch currentUser={CURRENT_USER} />} />
          <Route path="/profile" element={<Profile />} />

          {/* Sprint 2 routes */}
          <Route path="/timeline" element={<Timeline currentUser={CURRENT_USER} />} />
          <Route path="/contacts" element={<ContactsList />} />
          <Route path="/advisors" element={<AdvisorsList />} />
          <Route
            path="/settings/delete-account"
            element={<DeleteAccount currentUser={CURRENT_USER} />}
          />
          <Route
            path="/settings/user-type"
            element={<UserTypeSelect currentUser={CURRENT_USER} />}
          />
          <Route
            path="/signout"
            element={<SignOut currentUser={CURRENT_USER} onSignOut={() => {}} />}
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;