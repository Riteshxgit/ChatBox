import {BrowserRouter, Navigate, Route, Routes, RouterProvider, createBrowserRouter } from "react-router-dom";
import Auth from './pages/auth/auth-page';
import Profile from './pages/profile/profile-page';
import Chat from "./pages/chat/chat-page";
import { useAppStore } from "./store";
import { useState, useEffect } from "react";
import { GET_USER_INFO } from "./utils/constants";
import { apiClient } from "./lib/api-client";
import Loading from "./components/chat_page_components/contacts_container_components/Loading";


const PrivateRoute = ({children}) => {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to='/auth'/>;
}
const AuthRoute = ({children}) => {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to='/chat'/> : children;
}


function App() {
  const [loading, setLoading] = useState(true);
  const { userInfo, setUserInfo } = useAppStore();
  const getUserData = async () => {
    try {
      console.log('getUserData is called');
      const response = await apiClient.get(GET_USER_INFO, {withCredentials: true});
      setUserInfo(response.data.user);
      console.log('in App.jsx userInfo: '+ JSON.stringify(userInfo));
      console.log('in App.jsx response.data.user: '+ JSON.stringify(response.data.user));
    } catch (error) {
      console.error("error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    !userInfo ? getUserData() : setLoading(false);
  }, [userInfo]);  
  
  if(loading) {
    return <Loading />
  }    

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/auth' element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        }/>

        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }/>
        <Route path="/chat" element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }/>
        <Route path='*' element={<Navigate to='/auth'/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;