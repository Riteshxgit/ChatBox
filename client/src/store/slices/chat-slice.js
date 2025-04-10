export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  channels:[],
  setChannels: (channels) => set({channels}),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatMessages: (selectedChatMessages) => set({selectedChatMessages}),
  setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),
  addChannel: (channel)=> {
    const channels = get().channels;
    set({channels: [channel, ...channels]});
  },
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),
  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;
    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        { 
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        },
      ],
    });
  },
  addChannelInChannelList: (message) => {
    const channels = get().channels;
    const index = channels.findIndex(channel => channel._id === message.channelId);
  
    if(index >= 0) {
      const updatedChannel = channels[index];
  
      const newChannels = [
        updatedChannel,
        ...channels.filter((_, i) => i !== index)
      ];
  
      set({ channels: newChannels });
    }
  },
  addContactsInDMContacts: (message) => {
    const userId = get().userInfo._id;
    const fromId = message.sender._id === userId ? message.recipient._id : message.sender._id;
    const fromData = message.sender._id === userId ? message.recipient : message.sender;  
    const dmContacts = get().directMessagesContacts;
    const existingContactIndex = dmContacts.findIndex(contact => contact._id === fromId);  
    let updatedContacts = [];

    if (existingContactIndex >= 0) {
      const updatedContact = {
        ...dmContacts[existingContactIndex],
        lastMessage: message
      };  
      updatedContacts = [
        updatedContact,
        ...dmContacts.filter((_, idx) => idx !== existingContactIndex)
      ];
    } else {
      const newContact = {
        ...fromData,
        lastMessage: message
      };
      updatedContacts = [newContact, ...dmContacts];
    }
    set({ directMessagesContacts: updatedContacts });
  }
  
});
