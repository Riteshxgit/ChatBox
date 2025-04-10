import { useAppStore } from '@/store';
import { Avatar } from '@/components/ui/avatar';
import React from 'react'
import { RiCloseFill } from 'react-icons/ri'
import { AvatarImage } from '@radix-ui/react-avatar';
import { getColor } from '@/lib/utils';

function ChatHeader() {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore()
  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between ">
        <div className="flex gap-3 items-center justify-center">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            {
              selectedChatType === 'contacts' ? 
              (
                <Avatar className="w-12 h-12">
                  {selectedChatData.image ? (
                    <AvatarImage
                      src={selectedChatData.image}
                      alt="profile"
                      className="h-full w-full bg-black object-cover"
                    />
                  ) : (
                    <div
                      className={`uppercase w-12 h-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                        selectedChatData.color
                      )}`}
                    >
                      {selectedChatData.firstName ? selectedChatData.firstName.split("").shift() : selectedChatData.email[0]}
                    </div>
                  )}
                </Avatar>
              ) : (
                <div className=' bg-[#ffffff22] flex items-center justify-center rounded-full px-4 p-2'>#</div>
              )
            } 
          </div>
          <div>
            {selectedChatType === 'channel' && `${selectedChatData.name}` } 
            {selectedChatType === 'contacts' && (selectedChatData.firstName ? `${selectedChatData.firstName} ${selectedChatData.lastName}` : `${selectedChatData.email}`)}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button 
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all active:scale-90 active:bg-neutral-600 rounded-sm"
            onClick={closeChat}
          >
            <RiCloseFill
              className="hover:border hover:border-neutral-500 p-1 rounded-sm text-3xl"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader