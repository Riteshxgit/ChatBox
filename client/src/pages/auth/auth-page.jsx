import { useState } from 'react';
import Background from '../../assets/login2.png';
import Victory from '../../assets/victory.svg';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Button } from '../../components/ui/button.jsx';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client.js';
import { SIGNUP_ROUTE, LOGIN_ROUTE } from '../../utils/constants.js';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setUserInfo } = useAppStore();

  const validateSignup = () => {
    if(!email){
      toast.error('Email is required')
      return false;
    }
    if(!password){
      toast.error('Password is required')
      return false;
    }
    if(!confirmPassword || confirmPassword!==password) {
      toast.error('Password and Confirm Password should be same')
      return false;
    }
    return true;
  }

  const validateLogin = () => {
    if(!email){
      toast.error('Email is required')
      return false;
    }
    if(!password){
      toast.error('Password is required')
      return false;
    }
    return true;
  }

  const handleLogin = async () => {
    if(validateLogin()) {
      try {
        const response = await apiClient.post(LOGIN_ROUTE, {email, password}, {withCredentials: true});
        console.log('response.data.user -> ' + response.data.user._id)
        
        if(response.data.user._id){
          setUserInfo(response.data.user);
          if(response.data.user.prfileSetup) navigate('/chat');
          else navigate('/profile');
          toast.success('Login successful');
        }
      }catch (error) {
        console.error("error occured: " + error);
        alert('error occured: ' + error.message);
      }
    }
  }

  const handleSignup = async () => {
    if(validateSignup()) {
      try {
        console.log('signup validated successfully');
        const response = await apiClient.post(SIGNUP_ROUTE, {email, password}, {withCredentials: true});
        if(response.status === 201) {
          setUserInfo(response.data.user);
          navigate('/profile');
          toast.success('Signup successful');
        }
      }catch (error) {
        console.error("error occured: " + error);
        alert('error occured: ' + error.message);
      }
    }
  }
  
  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2 min-h-[700PX] px-4">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="victory image" className="w-[100px]" />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex items-center justify-center w-full pt-8">
              <Tabs className="w-3/4" defaultValue="login">
                <TabsList className="bg-transparent rounded-none w-full">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300 "
                  >
                    Signup
                  </TabsTrigger>
                </TabsList>
                <TabsContent className="flex flex-col gap-5 mb-17.5 mt-5" value="login">
                  <Input 
                    placeholder="Email" 
                    type="email" 
                    value={email} 
                    onChange={(e)=>setEmail(e.target.value)}
                    className="rounded-full p-6"
                  />
                  <Input 
                    placeholder="Password"  
                    type="password"  
                    value={password}  
                    onChange={(e)=>setPassword(e.target.value)}
                    className="rounded-full p-6" 
                  />
                  <Button className="rounded-full p-6" onClick={handleLogin}>
                    Login
                  </Button>
                </TabsContent>
                <TabsContent className="flex flex-col gap-5 mt-5" value="signup">
                  <Input 
                    placeholder="Email" 
                    type="email" 
                    value={email} 
                    onChange={(e)=>setEmail(e.target.value)}
                    className="rounded-full p-6"
                  />
                  <Input  
                    placeholder="Password"  
                    type="password"  
                    value={password}  
                    onChange={(e)=>setPassword(e.target.value)}
                    className="rounded-full p-6" 
                  />
                  <Input 
                    placeholder="Confirm Password"  
                    type="Password"   
                    value={confirmPassword}  
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    className="rounded-full p-6" 
                  />
                  <Button className="rounded-full p-6" onClick={handleSignup}>
                    Sign Up
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
        </div>
        <div className="hidden xl:flex items-center justify-center">
          <img src={Background} alt="background image" className="h-[700px]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;