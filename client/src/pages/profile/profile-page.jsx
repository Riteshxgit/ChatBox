import { useAppStore } from "@/store/index.js";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { FaTrash, FaPlus, FaSpinner } from "react-icons/fa"
import { Input } from '../../components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { apiClient } from "@/lib/api-client.js";
import { REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTE, UPDATE_PROFILE_IMAGE_ROUTE } from "@/utils/constants.js";
import { toast } from "sonner";


const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {userInfo, setUserInfo} = useAppStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
      setImage(userInfo.image);
    }
  }, [userInfo]);

  const handleNavigate = () => {
      if(userInfo.profileSetup) {
          navigate('/chat');
      }
      else {
          toast('Please setup your profile to continue');
          navigate('/profile');
      }
  }

  const validatedProfile = () => {
      if(!firstName) {
          toast('First name is required')
          return false;
      }
      if(!lastName) {
          toast('Last name is required')
          return false;
      }
      return true;
  } 

  const saveChanges = async () => {
    if (!validatedProfile()) return;
    setLoading(true);
    try {        
      const response = await apiClient.post(
        UPDATE_PROFILE_ROUTE,
        { firstName, lastName, color: selectedColor, image },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data) {
        setUserInfo(response.data.user);
        console.log("in profile-page.jsx userInfo: " + JSON.stringify(userInfo));
        toast.success(response.data.msg);
      }
    } catch (error) {
      console.error("error occurred: " + error);
      alert("Error occurred while saving changes: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleFileInputClick = () => {
      fileInputRef.current.click();
  }
  
  const handleImageChange = async (event) => {
    setLoading(true);
    try {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("profile-image", file);

        const response = await apiClient.post(
          UPDATE_PROFILE_IMAGE_ROUTE,
          formData,
          { withCredentials: true }
        );

        console.log("handleImageChange() called");

        if (response.status === 200 && response.data.user) {
          setUserInfo(response.data.user);
          setImage(response.data.user.image);
          toast.success("Profile image updated successfully");
        }
      }
    } catch (error) {
        toast.error('An error occurred while updating image: ' + error.message);
    } finally {
      setLoading(false);
    }
  } ;

  const handleDeleteImage = async () => {
    setLoading(true);
    try {
      const response = await apiClient.delete(
        REMOVE_PROFILE_IMAGE_ROUTE, 
        {withCredentials: true}
      );

      if (response.status === 200) {
        setUserInfo(response.data.user);
        setImage(null);
        toast.success('Profile image deleted successfully');
      } else {
        toast.error("Failed to delete profile image:", response);
      }
    } catch (error) {
      toast.error("Error deleting profile image:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div>
          <IoArrowBack
            className="text-4xl lg:text-6xl text-white/90 cursor-pointer hover:border-1 hover:border-neutral-500 rounded-lg active:scale-95 active:bg-neutral-600/50 transition:all duration-200 "
            onClick={handleNavigate}
          />
        </div>
        <div className="grid grid-cols-2">
          <div
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-cente"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="h-full w-full bg-black object-cover"
                />
              ) : (
                <div
                  className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                    selectedColor
                  )}`}
                >
                  {firstName
                    ? firstName.split("").shift()
                    : userInfo.email[0]}
                </div>
              )}
            </Avatar>
            {hovered && !loading && ( // only shows up when not loading(updating) and hovered 
              <div
                className="absolute inset-O h-32 w-32 md:w-48 md:h-48 flex items-center justify-center bg-black/50 rounded-full cursor-pointer ring-fuchsia-50 "
                onClick={image ? handleDeleteImage : handleFileInputClick}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
              name="profile-image"
              accept=".png, .jpg, .jpeg, .svg, .webp"
            />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className={`w-full flex gap-5 ${image ? "hidden" : ""}`}>
              {colors.map((color, index) => (
                <div
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    selectedColor === index
                      ? " !border-3 border-white/60"
                      : ""
                  }`}
                  key={index}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button
            className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300 flex items-center justify-center"
            onClick={saveChanges}
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="animate-spin text-xl" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;