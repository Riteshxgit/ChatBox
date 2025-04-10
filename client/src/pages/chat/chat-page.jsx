import { useEffect } from "react";
import { useAppStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";
const Chat = ()=>{
    const { userInfo, selectedChatType } = useAppStore();
    const navigate = useNavigate();    
    useEffect(()=>{
        if(!userInfo.profileSetup) {
            toast('Please setup your profile to continue');
            navigate('/profile');
        }
    },[userInfo, navigate, toast])


    return(
        <div className="flex h-[100vh] text-white overflow-hidden">
            <ContactsContainer />
            {selectedChatType ? <ChatContainer/> : <EmptyChatContainer  />}
        </div>
    )
}

export default Chat;
