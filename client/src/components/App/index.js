import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import NavBar, { NAV_WIDTH_COLLAPSED } from './NavBar';
import Profile from '../Profile';
import Search from './Search';
import CourseEquivalency from './CourseEquivalency';
import Messaging from '../Messaging';

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
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/messages" element={<Messaging />} />
          <Route path="/search" element={<Search />} />
          <Route path="/course-equivalency" element={<CourseEquivalency />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;