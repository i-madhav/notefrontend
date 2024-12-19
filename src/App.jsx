import './App.css'
import {createBrowserRouter} from "react-router-dom";
import SignIn from './components/signin';
import SignUp from './components/signup';
import Dashboard from './components/dashboard';
import ProfileComponent from './components/profile';

const AppLayoutRouting = createBrowserRouter([
  {
    path:"/",
    element:<SignIn/>
  },
  {
    path:"/signup",
    element:<SignUp/>
  },
  {
    path:"/dashboard",
    element:<Dashboard/>
  },
  {
    path:"/profile",
    element:<ProfileComponent/>
  }
])

export default AppLayoutRouting;
