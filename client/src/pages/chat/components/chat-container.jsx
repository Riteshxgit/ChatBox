import ChatHeader from '@/components/chat_page_components/chat_container_components/ChatHeader'
import MessageBar from '@/components/chat_page_components/chat_container_components/MessageBar'
import MessageContainer from '@/components/chat_page_components/chat_container_components/MessageContainer'
import React from 'react'

function ChatContainer() {
  return (
    <div className='fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1'>
      <ChatHeader/>
      <MessageContainer />
      <MessageBar />
    </div>
  )
}

export default ChatContainer