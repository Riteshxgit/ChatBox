import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES_ROUTE } from '@/utils/constants';
import moment from 'moment/moment';
import React, { useEffect, useRef, useState } from 'react'
import { MdFolderZip } from 'react-icons/md';
import { IoMdArrowRoundDown } from 'react-icons/io'
import { IoCloseSharp } from 'react-icons/io5';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getColor } from '@/lib/utils';
function MessageContainer() {
  const scrollRef = useRef();
  const [count, setCount] = useState(0);
  const { userInfo, selectedChatData, selectedChatType, selectedChatMessages, setSelectedChatMessages } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowImage(false);
        setImageUrl(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE, { id: selectedChatData._id }, { withCredentials: true });
        if (response.data.messages) {
          console.log('response.data.messages.length: ', response.data.messages.length)
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log('error occured while geting chat messages: ', error);
      }
    };
    const getChannelMessages = async () => {
      try {
        // console.log('herw1')
        const response = await apiClient.get(`${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`, { withCredentials: true }); 
        console.log('here2');
        if (response.data.messages) {
          console.log('getChannelMessages called and response.data.messages.length: ', response.data.messages.length);
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log('error occured while getting channel messages: ', error);
      }
    }
    if (selectedChatData._id && selectedChatType == 'contacts') getMessages();
    else if (selectedChatData._id && selectedChatType == 'channel') getChannelMessages();
  }, [selectedChatData, selectedChatType])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behaviour: 'smooth' })
    }
  }, [selectedChatMessages]) ;

  const getDisplayName = (url) => {
    console.log('url: ', url);
    const filenamePart = url.split('/').pop();
    const displayName = filenamePart.replace(/^\d+-/, '');
    return displayName;
  };
  
  const checkIfImage = (filePath) => {
    const imageRegex = 
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath); 
  };

  const downloadFile = async (filePath) => {
    try {
      // Extract filename from URL (removing timestamp prefix if exists)
      const filename = filePath.split('/').pop().replace(/^\d+-/, '');
      
      // Fetch the file from Cloudinary
      const response = await apiClient.get(filePath, {
        responseType: 'blob',
      });
  
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
  
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Set the filename
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: Open in new tab if download fails
      window.open(filePath, '_blank');
    }
  }; 

  const renderDMMessages = (message) => {
    const isCurrentUser = message.sender === selectedChatData._id;
    
    return (
      <div className={`mt-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
  
          <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            <div className={`
              rounded-lg p-3
              ${isCurrentUser 
                ? 'bg-[#8417ff] text-white rounded-tr-none' 
                : 'bg-[#2a2b33] text-white rounded-tl-none'
              }
            `}>
              {message.messageType === 'text' ? (
                <p className="break-words">{message.content}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {checkIfImage(message.fileUrl) ? (
                    <img 
                      src={message.fileUrl}
                      className="max-h-60 rounded-md cursor-pointer"
                      onClick={() => {
                        setShowImage(true);
                        setImageUrl(message.fileUrl);
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-2 bg-black/20 rounded-md">
                      <MdFolderZip className="text-xl" />
                      <span className="flex-1">{getDisplayName(message.fileUrl)}</span>
                      <button 
                        onClick={() => downloadFile(message.fileUrl)}
                        className="p-2 rounded-full hover:bg-black/30"
                      >
                        <IoMdArrowRoundDown />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
  
            <span className="text-xs text-gray-500 mt-1">
              {moment(message.timestamp).format('h:mm A')}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  const renderChannelMessages = (message) => {
    const isCurrentUser = message.sender._id === userInfo._id;
    
    return (
      <div className={`mt-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          {!isCurrentUser && (
            <div className="flex-shrink-0 mr-2 self-start mt-1"> 
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.sender.image} />
                <AvatarFallback className={`uppercase text-sm ${getColor(message.sender.color)}`}>
                  {message.sender.firstName?.[0] || message.sender.email[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
  
          <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            {!isCurrentUser && (
              <span className="text-xs text-gray-400 mb-1 ml-1">
                {message.sender.firstName || message.sender.email.split('@')[0]}
              </span>
            )}
  
            <div className={`
              rounded-lg p-3
              ${isCurrentUser 
                ? 'bg-[#8417ff] text-white rounded-tr-none' 
                : 'bg-[#2a2b33] text-white rounded-tl-none'
              }
            `}>
              {message.messageType === 'text' ? (
                <p className="break-words">{message.content}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {checkIfImage(message.fileUrl) ? (
                    <img 
                      src={message.fileUrl}
                      className="max-h-60 rounded-md cursor-pointer"
                      onClick={() => {
                        setShowImage(true);
                        setImageUrl(message.fileUrl);
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-2 bg-black/20 rounded-md">
                      <MdFolderZip className="text-xl" />
                      <span className="flex-1">{getDisplayName(message.fileUrl)}</span>
                      <button 
                        onClick={() => downloadFile(message.fileUrl)}
                        className="p-2 rounded-full hover:bg-black/30"
                      >
                        <IoMdArrowRoundDown />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
  
            <span className="text-xs text-gray-500 mt-1">
              {moment(message.timestamp).format('h:mm A')}
            </span>
          </div>
        </div>
      </div>
    );
  };


  const renderMessages = () => {
    let lastDate = null;
    console.log('selectedChatMessages.length: ', selectedChatMessages.length);
    return selectedChatMessages.map((message) => {
      const messageDate = moment(message.timestamp).format('YYYY-MM-DD');
      const showDate = (messageDate !== lastDate);
      lastDate = messageDate;
      return (
        <div key={message._id}>
          {showDate &&
            <div className='text-center text-gray-500 my-2'>
              {moment(message.timestamp).format('LL')}
            </div>}
          { selectedChatType === 'contacts' && renderDMMessages(message) }
          { selectedChatType === 'channel' && renderChannelMessages(message)}
        </div>
      )
    })
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 w-full">
      {renderMessages()}
      <div ref={scrollRef}></div>
      {
        showImage && (
          <div className='fixed z-[100] inset-0 bg-black/90 flex flex-col items-center justify-center p-4'>
            <div className='max-w-[90vw] max-h-[80vh] mb-4 flex items-center justify-center'>
              <img
                src={imageUrl}
                className='max-h-full max-w-full object-contain'
                alt="Full screen preview"
              />
            </div>

            <div className='flex gap-4 mt-4'>
              <button
                className='bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300'
                onClick={() => downloadFile(imageUrl)}
              >
                <IoMdArrowRoundDown className="text-xl" />
                <span>Download</span>
              </button>

              <button
                className='bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300'
                onClick={() => {
                  setShowImage(false);
                  setImageUrl(null);
                }}
              >
                <IoCloseSharp className="text-xl" />
                <span>Close</span>
              </button>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default React.memo(MessageContainer);