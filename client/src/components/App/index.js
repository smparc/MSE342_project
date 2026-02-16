import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import NavBar from './NavBar';
import Profile from './Profile';
import Search from './Search';
import Messaging from '../Messaging';

const MainLayout = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: 'background.default',
      pb: 8,
    }}
  >
    {children}
  </Box>
);

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/messages" element={<Messaging />} />
        </Routes>
        <NavBar />
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
