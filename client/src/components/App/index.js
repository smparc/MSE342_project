import { useEffect, useState, useContext } from 'react';
import { BrowserRouter} from 'react-router-dom';

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