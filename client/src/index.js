import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './components/App';
import Firebase, { FirebaseContext } from './components/Firebase';
import appTheme from './theme/appTheme';
import './index.css';

// Cypress E2E: use mock Firebase so tests run without real auth
const createCypressFirebase = () => ({
  auth: {
    onAuthStateChanged: (callback) => {
      callback({ email: 'elly@uwaterloo.ca', uid: 'cypress-test-user' });
      return () => {};
    },
  },
  doSignOut: () => Promise.resolve(),
  doSignInWithEmailAndPassword: () => Promise.resolve(),
  doCreateUserWithEmailAndPassword: () => Promise.resolve(),
});

const firebase = window.Cypress ? createCypressFirebase() : new Firebase();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <FirebaseContext.Provider value={firebase}>
        <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </FirebaseContext.Provider>,
);