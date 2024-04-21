import '@mantine/core/styles.css';
import './App.css';

import { MantineProvider } from '@mantine/core';
import { Route } from 'wouter';
import Index from './pages/Index';
import { Header } from './components/header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Search from './pages/Search';
import Logout from './pages/Logout';

function App() {
  return (
    <MantineProvider>
      <Header></Header>
      <Route path="/">
        <Index></Index>
      </Route>
      <Route path="/home">
        <Home></Home>
      </Route>
      <Route path="/search">
        <Search></Search>
      </Route>
      <Route path="/login">
        <Login></Login>
      </Route>
      <Route path="/signup">
        <Signup></Signup>
      </Route>
      <Route path="/logout">
        <Logout></Logout>
      </Route>
    </MantineProvider>
  );
}

export default App;
