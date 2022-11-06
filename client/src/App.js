import './App.css';
import React, { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Landing from './components/layout/Landing';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import ProfileForm from './components/profile-forms/ProfileForm';
import AddEducation from './components/profile-forms/AddEducation';
import AddExperience from './components/profile-forms/AddExperience';
import Profiles from './components/profiles/Profiles';
import Profile from './components/profile/Profile';
import NotFound from './components/layout/NotFound'
import Post from './components/post/Post';
import Posts from './components/posts/Posts';
import { loadUser } from './actions/auth';

//Redux
import { Provider } from 'react-redux';
import store from './store'

const App = () => { 
  
  useEffect(() => {
    store.dispatch(loadUser());
  });

  return(
    <Provider store={store}>
    <Router>
          <Navbar />
          <Alert />
          <Routes>
            <Route exact path="/" element={<Landing/>} />
            <Route exact path='/register' element={<Register/>}/>
            <Route exact path='/login' element={<Login/>}/>
            <Route path="profiles" element={<Profiles />} />
            <Route path='profile' element={<Profile />} />
            <Route
            path="/dashboard"
            element={<PrivateRoute component={Dashboard} />}
            />
            <Route
            path="create-profile"
            element={<PrivateRoute component={ProfileForm} />}
            />
            <Route
            path="edit-profile"
            element={<PrivateRoute component={ProfileForm} />}
          />
          <Route
            path="add-experience"
            element={<PrivateRoute component={AddExperience} />}
          />
          <Route
            path="add-education"
            element={<PrivateRoute component={AddEducation} />}
          />
          <Route path="posts" element={<PrivateRoute component={Posts} />} />
          <Route path="posts/:id" element={<PrivateRoute component={Post} />} />
          <Route path="/*" element={<NotFound />} />
          </Routes>
    </Router>
    </Provider>
  )
};

export default App;
