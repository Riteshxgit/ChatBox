import { getColor } from '@/lib/utils';
import { useAppStore } from '@/store';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import React, { useEffect } from 'react'

function contactsList({ contacts, isChannel = false }) {
    const { selectedChatData, setSelectedChatData, selectedChatType, setSelectedChatType, selectedChatMessages, setSelectedChatMessages } = useAppStore();

    const handleClick = (contact) => {
        // Set the chat type - make sure this matches what you check in MessageContainer
        if (isChannel) setSelectedChatType('channel');
        else setSelectedChatType('contacts'); // This must match the check in MessageContainer

        setSelectedChatData(contact);

        // Clear messages when switching contacts
        if (selectedChatData && selectedChatData._id !== contact._id) {
            setSelectedChatMessages([]);
        }
    }

    return (
        <div className='mt-5'>
            {contacts.map((contact) => (
                <div key={contact._id}
                    className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${selectedChatData && selectedChatData._id === contact._id ? 'bg-[#8417ff]' : 'hover:bg-[#1f1f1f111]'}`}
                    onClick={() => handleClick(contact)}
                >
                    <div className='flex gap-5 items-center justify-start text-neutral-300'>
                        {!isChannel && <div className="relative h-10 w-10 overflow-hidden rounded-full">
                            <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                                {contact.image ? (
                                    <AvatarImage
                                        src={contact.image}
                                        alt="profile"
                                        className="h-full w-full bg-black object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`uppercase w-10 h-10 text-lg border-[1px] flex items-center justify-center rounded-full { ${selectedChatData && selectedChatData._id === contact._id ? 'border-2 bg-white/50' : getColor(
                                            contact.color)}
                                    }`}
                                    >
                                        {contact.firstName ? contact.firstName.split("").shift() : contact.email[0]}
                                    </div>
                                )}
                            </Avatar>
                        </div>}
                        {isChannel && <div className=' bg-[#ffffff22] flex items-center justify-center rounded-full px-4 p-2'>#</div>}
                        {isChannel ? <span>{contact.name} </span> : <span>{contact.firstName} {contact.lastName}</span>}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default contactsList;