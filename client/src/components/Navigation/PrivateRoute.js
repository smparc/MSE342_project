import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from '../SignIn';

import NavBar, { NAV_WIDTH_COLLAPSED } from '../App/NavBar';
import Profile from '../Profile';
import ProfilePage from '../Profile/ProfilePage';
import Search from '../App/Search';
import CourseSearch from '../CourseSearch';
import CourseSubmit from '../CourseSubmit';
import Messaging from '../Messaging';
import Timeline from '../Timeline';
import ContactsList from '../ContactsList';
import DeleteAccount from '../DeleteAccount';
import UserTypeSelect from '../SignIn/UserTypeSelect';
import ExchangeCalendar from '../ExchangeCalendar';
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
    const [userExistsInDb, setUserExistsInDb] = useState(false);

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
                    if (data.username) {
                        setCurrentUser(data.username);
                        setUserExistsInDb(true);
                    } else {
                        setUserExistsInDb(false);
                    }
                } else {
                    // User not found in DB - still in sign-up flow
                    setUserExistsInDb(false);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setUserExistsInDb(false);
            } finally {
                setLoading(false);
            }
        };

        if (authenticated) {
            fetchUsername();
        } else {
            setLoading(false);
            setUserExistsInDb(false);
        }
    }, [authenticated, authUser]);

    // Show loading while checking user status
    if (authenticated && loading) {
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

    // Not authenticated OR user doesn't exist in DB yet (still signing up)
    if (!authenticated || !userExistsInDb) {
        return (
            <Routes>
                <Route path="*" element={<SignIn />} />
            </Routes>
        );
    }

    // Authenticated users: redirect "/" to profile page
    return (
        <>
            <NavBar currentUser={currentUser} authUser={authUser} />
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Navigate replace to="/profile" />} />
                    <Route path="/SignIn" element={<Navigate replace to="/profile" />} />
                    <Route path="/messages" element={<Messaging currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/search" element={<Search currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/course-equivalency/submit" element={<CourseSubmit currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/course-equivalency" element={<CourseSearch currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/profile" element={<Profile currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/profile/:username" element={<ProfilePage currentUser={currentUser} authUser={authUser} />} />
                    {/* Sprint 2 routes */}
                    <Route path="/timeline" element={<Timeline currentUser={currentUser} authUser={authUser} />} />
                    <Route path="/calendar" element={<ExchangeCalendar currentUser={currentUser} />} />
                    <Route path="/contacts" element={<ContactsList />} />
                    <Route
                        path="/settings/delete-account"
                        element={<DeleteAccount currentUser={currentUser} authUser={authUser} />}
                    />
                    <Route
                        path="/settings/user-type"
                        element={<UserTypeSelect currentUser={currentUser} authUser={authUser} />}
                    />

                </Routes>
            </MainLayout>
        </>
    );
};

export default PrivateRoute;
