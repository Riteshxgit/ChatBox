import React, { useEffect } from 'react'
import { Avatar, AvatarImage} from '@radix-ui/react-avatar';
import { useState } from 'react';
import { useAppStore } from '@/store';
import { colors, getColor } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { IoPowerSharp } from 'react-icons/io5';
import { apiClient } from '@/lib/api-client';
import { LOGOUT_ROUTE } from '@/utils/constants';
import { toast } from 'sonner';

function ProfileInfo() {
  const navigate = useNavigate()
  const {userInfo, setUserInfo} = useAppStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(()=>{
    if(userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setSelectedColor(userInfo.color);
      setImage(userInfo.image);
    }
  }, [userInfo]);

  const handleLogout = async () => {
    try {      
      const response = await apiClient.post(LOGOUT_ROUTE,
        {},
        {withCredentials: true}
      );

      if(response.status === 200) {        
        localStorage.clear();
        sessionStorage.clear();

        const a = document.createElement('a');
        a.href = '/';
        a.style.display = 'none';
        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error('error occured while logging out: ', error.msg)
    }    
  }

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
      <div className="flex justify-center items-center gap-3 cursor-pointer" onClick={()=>navigate('/profile')}>
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <Avatar className="w-12 h-12">
            {image ? (
              <AvatarImage
                src={image}
                alt="profile"
                className="h-full w-full bg-black object-cover"
              />
            ) : (
              <div
                className={`uppercase w-12 h-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  selectedColor
                )}`}
              >
                {firstName ? firstName.split("").shift() : userInfo.email[0]}
              </div>
            )}
          </Avatar>
        </div>
        <div>
          {userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : ""}
        </div>
      </div>
      <div className="flex gap-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2 className='text-purple-500 font-medium text-xl' onClick={()=>navigate('/profile')}/>
            </TooltipTrigger>
            <TooltipContent className='bg-[#1c1b1e] border-none text-white'>
              <p>Edit Profile</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp className='text-red-500 font-medium text-xl' onClick={handleLogout}/>
            </TooltipTrigger>
            <TooltipContent className='bg-[#1c1b1e] border-none text-white'>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default ProfileInfo