import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from '../SignIn';
import LandingPage from '../Landing';
import HomePage from '../Home';

import NavBar, { NAV_WIDTH_COLLAPSED } from '../App/NavBar';
import Profile from '../Profile';
import Search from '../Search';
import CourseSearch from '../CourseSearch';
import CourseSubmit from '../CourseSubmit';
import Messaging from '../Messaging';
import Box from '@mui/material/Box';

// Replace with auth when available (used for course search shortlist & submit)
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

const PrivateRoute = ({ authenticated }) => {
    return (
        <Routes>
            <Route
                path="/"
                element={authenticated ? <HomePage /> : <LandingPage />}
            />
            <Route
                path="/SignIn"
                element={authenticated ? <Navigate replace to="/" /> : <SignIn />}
            />
            {/* Add other routes here */}
            <NavBar />
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Navigate to="/profile" replace />} />
                    <Route path="/messages" element={<Messaging />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/course-equivalency/submit" element={<CourseSubmit currentUser={CURRENT_USER} />} />
                    <Route path="/course-equivalency" element={<CourseSearch currentUser={CURRENT_USER} />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </MainLayout>
        </Routes>
    );
};
export default PrivateRoute;