import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from '../SignIn';

import NavBar, { NAV_WIDTH_COLLAPSED } from '../App/NavBar';
import Profile from '../Profile';
import Search from '../App/Search';
import CourseSearch from '../CourseSearch';
import CourseSubmit from '../CourseSubmit';
import Messaging from '../Messaging';
import Timeline from '../Timeline';
import ContactsList from '../ContactsList';
import AdvisorsList from '../AdvisorsList';
import DeleteAccount from '../DeleteAccount';
import UserTypeSelect from '../UserTypeSelect';
import SignOut from '../SignOut';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

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

const PrivateRoute = ({ authenticated, authUser }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch username from database based on email
    useEffect(() => {
        const fetchUsername = async () => {
            if (!authUser?.email) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/users/by-email/${encodeURIComponent(authUser.email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data.username);
                } else {
                    // Fallback to email prefix if user not found in DB
                    setCurrentUser(authUser.email.split('@')[0]);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setCurrentUser(authUser.email.split('@')[0]);
            } finally {
                setLoading(false);
            }
        };

        if (authenticated) {
            fetchUsername();
        } else {
            setLoading(false);
        }
    }, [authenticated, authUser]);

    if (!authenticated) {
        return (
            <Routes>
                <Route path="*" element={<SignIn />} />
            </Routes>
        );
    }

    // Show loading while fetching username
    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Authenticated users: redirect "/" to profile page
    return (
        <>
            <NavBar />
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Navigate replace to="/profile" />} />
                    <Route path="/SignIn" element={<Navigate replace to="/profile" />} />
                    <Route path="/messages" element={<Messaging currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/course-equivalency/submit" element={<CourseSubmit currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/course-equivalency" element={<CourseSearch currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/profile" element={<Profile currentUser={currentUser} authUser={authUser} />} />
                    {/* Sprint 2 routes */}
                    <Route path="/timeline" element={<Timeline currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/contacts" element={<ContactsList />} />
                    <Route path="/advisors" element={<AdvisorsList />} />
                    <Route
                        path="/settings/delete-account"
                        element={<DeleteAccount currentUser={currentUser} authUser={authUser} />}
                    />
                    <Route
                        path="/settings/user-type"
                        element={<UserTypeSelect currentUser={currentUser} authUser={authUser} />}
                    />
                    <Route
                        path="/signout"
                        element={<SignOut currentUser={currentUser} authUser={authUser} onSignOut={() => { }} />}
                    />
                </Routes>
            </MainLayout>
        </>
    );
};

export default PrivateRoute;
