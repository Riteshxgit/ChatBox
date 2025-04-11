import Logo from '@/components/chat_page_components/contacts_container_components/Logo'
import Title from '@/components/chat_page_components/contacts_container_components/Title'
import React, { useEffect, useState } from 'react'
import ProfileInfo from '@/components/chat_page_components/contacts_container_components/ProfileInfo'
import NewDM from '@/components/chat_page_components/contacts_container_components/NewDM'
import { GET_DM_CONTACTS_ROUTE, GET_USER_CHANNELS_ROUTE } from '@/utils/constants'
import { apiClient } from '@/lib/api-client'
import { useAppStore } from '@/store'
import ContactsList from '@/components/chat_page_components/contacts_container_components/contactsList'
import CreateChannel from '@/components/chat_page_components/contacts_container_components/CreateChannel'

function ContactsContainer() {

  const { directMessagesContacts, setDirectMessagesContacts, selectedChatMessages, channels, setChannels} = useAppStore();

  useEffect(()=>{
    const getContacts = async () => {
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTE, {withCredentials: true});
      if(response.data.contacts) {
        setDirectMessagesContacts(response.data.contacts);
      }
    }
    const getChannels = async () => {
      const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, {withCredentials: true});
      if(response.data.channels) {
        setChannels(response.data.channels);
      }
    }

    getChannels();
    getContacts();
  }, []);

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full flex flex-col">
      <div className='pt-3'>
        <Logo />
      </div>
      <div className='my-3'>
        <div className=' flex items-center justify-between pr-10 '>
          <Title text="Direct Messages"/>
          <NewDM />
        </div>
        <div className=" max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactsList contacts={directMessagesContacts} />
        </div>
      </div>
      <div className='my-3'>
        <div className=' flex items-center justify-between pr-10 '>
          <Title text="Channels"/>
          <CreateChannel />
        </div>
        <div className=" max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactsList contacts={channels} isChannel={true} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  )
}

export default ContactsContainer