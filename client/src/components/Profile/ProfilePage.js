import * as React from 'react';
import { useParams } from 'react-router-dom';
import Profile from './index';

/**
 * Wrapper that reads username from route params for viewing another user's profile.
 * /profile -> shows current user
 * /profile/:username -> shows that user
 */
const ProfilePage = ({ currentUser, authUser }) => {
  const { username: routeUsername } = useParams();
  return (
    <Profile
      currentUser={currentUser}
      authUser={authUser}
      viewUsername={routeUsername}
    />
  );
};

export default ProfilePage;
