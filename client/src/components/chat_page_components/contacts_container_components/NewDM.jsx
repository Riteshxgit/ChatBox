import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { animationDefaultOptions, getColor } from '@/lib/utils'
import Lottie from 'react-lottie'
import { apiClient } from '@/lib/api-client';
import { SEARCH_CONTACTS_ROUTE } from '@/utils/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/store';

function NewDM() {
  const [openNewContactModel, setOpenNewContactModel] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([])
  const {  setSelectedChatData,  setSelectedChatType } = useAppStore()

  useEffect(()=>{
    if(!openNewContactModel) {
      setSearchedContacts([]);
    }
  }, [openNewContactModel]);

  const searchContacts = async (searchTerm) => {
    try {
      console.log('searchContacts called');
      
      if(!searchTerm){
        setSearchedContacts([]);
        return;
      }
      const response = await apiClient.post(SEARCH_CONTACTS_ROUTE, {searchTerm}, {withCredentials: true});
      if(response.status === 200 && response.data.contacts) {
        setSearchedContacts(response.data.contacts);
      }
    } catch (error) {
      setSearchedContacts([]);
      console.log('error occured while searching contacts: ' + error.message)
    }
  }

  const selectNewContact = (contact) => {
    setOpenNewContactModel(false);
    setSelectedChatType('contacts');
    setSelectedChatData(contact);
    setSearchedContacts([]);
  }

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className=' text-neutral-400/70 font-light opacity-90 hover:text-neutral-100 text-start cursor-pointer transition-all duration-300'
              onClick={() => setOpenNewContactModel(true)}
            />
          </TooltipTrigger>
          <TooltipContent className='bg-[#1c1b1e] border-none mb-2 p-3 text-white'>
            <p>Select New Contact</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewContactModel} onOpenChange={setOpenNewContactModel}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please select a contact</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => searchContacts(e.target.value)}
            />
          </div>
          {searchedContacts.length > 0 && <ScrollArea className='h-[250px]'>
            <div className='flex flex-col gap-5'>
              {searchedContacts.map((contact)=>
                <div
                  key={contact._id}
                  className="flex items-center gap-3 p-2 hover:bg-[#151619] rounded-md cursor-pointer"
                  onClick={()=>selectNewContact(contact)} 
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Avatar className="w-12 h-12">
                      {contact.image ? (
                        <AvatarImage
                          src={contact.image}
                          alt="profile"
                          className="h-full w-full bg-black object-cover"
                        />
                      ) : (
                        <div
                          className={`uppercase w-12 h-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                            contact.color
                          )}`}
                        >
                          {contact.firstName ? contact.firstName.split("").shift() : contact.email[0]}
                        </div>
                      )}
                    </Avatar>
                  </div>
                  <div className='flex flex-col'>
                    <span>
                      {contact.firstName && contact.lastName
                        ? `${contact.firstName} ${contact.lastName}`
                        : `${contact.email}`}
                    </span>
                    <span className='text-xs'>{contact.email}</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>}
          {searchedContacts.length <= 0 && <div>
            <div className="flex-1 md:bg-[#181920] md:flex flex-col justify-center items-center duration-1000 transition-all mt-5">
              <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={animationDefaultOptions}
              />
              <div
                className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 xl:text-3xl text-2xl transition-all duration-300 text-center"
              >
                <h3 className="poppins-medium">
                  Search New
                  <span className="text-purple-500"> Contact. </span>
                </h3>
              </div>
            </div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NewDM