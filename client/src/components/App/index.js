import * as React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Review from './Review';
import Messaging from '../Messaging';

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          <Link to="/" style={{ marginRight: 16 }}>Home</Link>
          <Link to="/messaging">Messages</Link>
        </nav>
        <Routes>
          <Route path="/" element={
            <div style={{ padding: 16 }}>
              <h1>MSci 245 - D1 template</h1>
              {/* Render <Review /> child component */}
            </div>
          } />
          <Route path="/messaging" element={<Messaging />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
