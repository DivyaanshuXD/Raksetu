import React from 'react';
import { auth } from '../firebase';
import About from './About';
import Dashboard from './Dashboard';

const Home = () => {
  const user = auth.currentUser;
  return user ? <Dashboard /> : <About />;
};

export default React.memo(Home);