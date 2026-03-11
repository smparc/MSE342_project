import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import Firebase, { FirebaseContext } from './components/Firebase';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <FirebaseContext.Provider value={new Firebase()}>
        <App />
    </FirebaseContext.Provider>,
);