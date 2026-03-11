import { useEffect, useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import NavBar, { NAV_WIDTH_COLLAPSED } from './NavBar';
import Profile from '../Profile';
import Search from './Search';
import CourseSearch from '../CourseSearch';
import CourseSubmit from '../CourseSubmit';
import Messaging from '../Messaging';

import PrivateRoute from '../Navigation/PrivateRoute';
import { FirebaseContext } from '../Firebase';



const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const firebase = useContext(FirebaseContext);

  useEffect(() => {
    if (firebase) {
      const listener = firebase.auth.onAuthStateChanged(user => {
        if (user) {
          setAuthUser(user);
        } else {
          setAuthUser(null);
        }
      });
      // Cleanup: unsubscribe the listener when the component unmounts
      return () => listener();
    }
  }, [firebase]);

  const authenticated = !!authUser;

  return (
    <BrowserRouter>
      <PrivateRoute authenticated={authenticated} authUser={authUser} />
      
    </BrowserRouter>
  );
};

export default App;
