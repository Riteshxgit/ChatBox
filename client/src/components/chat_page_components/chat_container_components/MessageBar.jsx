import EmojiPicker from 'emoji-picker-react';
import React, { useEffect } from 'react'
import { useState, useRef } from 'react'
import { GrAttachment } from 'react-icons/gr'
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { useAppStore } from '@/store';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/api-client';
import { UPLOAD_FILE_ROUTE } from '@/utils/constants';
import { ImSpinner8 } from 'react-icons/im';
import { Textarea } from '@/components/ui/textarea';

function MessageBar() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef()
  const [message, setMessage] = useState('');
  const emojiRef = useRef();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const socket = useSocket();
  const { userInfo, selectedChatData, selectedChatType } = useAppStore();
  
  useEffect(()=>{
    function handleClickEvent(event) {
      if(emojiRef.current && !emojiRef.current.contains(event.target)){
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickEvent);
    return ()=>{
      document.removeEventListener('mousedown', handleClickEvent);
    }
  }, [emojiRef])

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => (msg + emoji.emoji));
  }

  const handleSendMessage = async () => {
    if (!message.trim() && !isUploading) return;
  
    if (selectedChatType === "contacts") {
      socket.emit('sendMessage', {
        sender: userInfo._id,
        content: message.trim(),
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
      setMessage('');
    } else if (selectedChatType === 'channel') {
      socket.emit('send-channel-message', {
        sender: userInfo._id,
        content: message.trim(),
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
      setMessage('');
    }
  };

  const handleAttachmentClick = () => {
    if(fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleAttachmentChange = async (event) => {
    try {
      setIsUploading(true);
      const file = event.target.files[0];
      if(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {withCredentials: true});
        
        if(response.status===200 && response.data) {
          if(selectedChatType === 'contacts') {
            socket.emit('sendMessage', {
              sender: userInfo._id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: response.data.filePath,
            });
          } else if (selectedChatType === 'channel') {
            socket.emit('send-channel-message', {
              sender: userInfo._id,
              content: undefined,
              messageType: "file",
              fileUrl: response.data.filePath,
              channelId: selectedChatData._id,
            });
          }
        }
      }
    } catch (error) {
      console.log('error occured while uploading file: ', error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents new line in textarea
      handleSendMessage();
    }
    // Allow Shift+Enter for new lines
  };

  return (
    <div className=" flex justify-center items-center bg-[#1c1d25] h-[10vh] px-8 mb-5 gap-6 ">
      <div className="flex flex-1 bg-[#2a2b33] rounded-md gap-5 items-center pr-5">
        <Textarea
          type="text"
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="
            bg-transparent 
            flex-1 
            p-5 
            rounded-md 
            border-none 
            focus:border-none 
            focus:outline-none 
            resize-none 
            max-h-[10vh] 
            pb-2 
            overflow-y-auto
            [&::-webkit-scrollbar]:hidden
          "
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        />

        <button 
          className={`text-neutral-500 ${isUploading ? 'animate-pulse' : "text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all active:scale-90 active:bg-neutral-600 rounded-sm"
}`}
          onClick={handleAttachmentClick}
          disabled={isUploading}
        >
          <GrAttachment className="hover:border-neutral-500 p-1 rounded-sm text-2xl" />
        </button>
        <input type='file' className='hidden' ref={fileInputRef} onChange={handleAttachmentChange}/>

        <div className="relative h-6 w-6" ref={emojiRef}>
          <button 
            onClick={()=>setEmojiPickerOpen(true)}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all active:scale-90 active:bg-neutral-600 rounded-sm"
          >  
            <RiEmojiStickerLine className="hover:border-neutral-500 p-1 rounded-sm text-2xl" />
          </button>

          <div className="absolute bottom-8 -right-9 scale-90">
            <EmojiPicker 
              theme='dark'
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>

      <button 
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 focus:border-none hover:bg-[#741bda] focus:outline-none focus:text-white active:scale-95 duration-200 transition-all"
        onClick={handleSendMessage}
        disabled={isUploading || !message.trim()}
      >
        {isUploading ? (
          <ImSpinner8 className="p-1 text-2xl animate-spin" />
        ) : (
          <IoSend className="p-1 text-2xl" />
        )}
      </button>
    </div>
  );
}

export default MessageBar