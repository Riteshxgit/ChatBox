import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import MultipleSelector from '@/components/ui/multipleselect';
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTE } from '@/utils/constants';
import { toast } from 'sonner';

function CreateChannel() {
  const [openNewChannelModel, setOpenNewChannelModel] = useState(false);
  const {  setSelectedChatData,  setSelectedChatType, addChannel } = useAppStore()
  const [newChannelModal, setNewChannelModal] = useState(false);

  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState('')

  useEffect(()=> {
    const getData = async () => {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {withCredentials: true});
      setAllContacts(response.data.contacts)
    }
    getData();
  }, [])

  const createChannel = async () => {
    try {
      if(channelName.length<=0) {
        toast('Please Enter Channel Name');
        return;  
      }
      if(selectedContacts.length >= 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: channelName,
            members: selectedContacts.map((contact) => contact.value)
          },
          {withCredentials: true}
        );
        if(response.status === 201) {
          setChannelName('');
          setSelectedContacts([]);
          setNewChannelModal(false);
          addChannel(response.data.channel);
        }
      }
    } catch (error) {
      console.log('error occured while creating channel: ', error);
    }
  }

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className=' text-neutral-400/70 font-light opacity-90 hover:text-neutral-100 text-start cursor-pointer transition-all duration-300'
              onClick={() => setOpenNewChannelModel(true)}
            />
          </TooltipTrigger>
          <TooltipContent className='bg-[#1c1b1e] border-none mb-2 p-3 text-white'>
            <p>Create New Channel</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewChannelModel} onOpenChange={setOpenNewChannelModel}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please fill up the details for New Channel</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => setChannelName(e.target.value)}
              value = {channelName}
            />
          </div>
          <div>
            <MultipleSelector 
              className="rounded-lg bg-[#2c2e2b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className='text-center text-lg leading-10 text-gray-600'>no results found.</p>
              }
            />
          </div>
          <div>
            <button 
              className=" w-full bg-[#8417ff] rounded-md flex items-center justify-center p-2 focus:border-none hover:bg-[#741bda] focus:outline-none focus:text-white active:scale-95 duration-200 transition-all"
              onClick={createChannel}
            >
              Create New Channel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateChannel;

// import React from 'react'

// function CreateChannel() {
//   return (
//     <div>CreateChannel</div>
//   )
// }

// export default CreateChannel