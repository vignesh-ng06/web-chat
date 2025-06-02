import React from 'react';
import moment from 'moment';
import { Timestamp } from 'firebase/firestore';
import ChatHeader from './ChatHeader';

interface Message {
  id: string;
  sender: string;
  content: string;
  time: Timestamp;
  image?: string;
}

interface User {
  id: string;
  avatarUrl?: string;
  name?: string;
}

interface MessageCardProps {
  message: Message;
  me: User;
  other: User;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, me, other }) => {
  const isMessageFromMe = message.sender === me.id;

  const formatTimeAgo = (timestamp: Timestamp): string => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  return (
    <>
    <div key={message.id} className={`flex mb-4 ${isMessageFromMe ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar on the left or right based on the sender */}
      <div className={`w-10 h-10 ${isMessageFromMe ? 'ml-2 mr-2' : 'mr-2'}`}>
        <img
          className="w-full h-full object-cover rounded-full"
          src={isMessageFromMe ? me.avatarUrl : other.avatarUrl}
          alt="Avatar"
        />
      </div>

      {/* Message bubble on the right or left based on the sender */}
      <div className={`text-white p-2 rounded-md ${isMessageFromMe ? 'bg-blue-500 self-end' : 'bg-[#19D39E] self-start'}`}>
        {message.image && (
          <img src={message.image} className="max-h-60 w-60 mb-4" alt="Message Attachment" />
        )}
        <p>{message.content}</p>
        <div className="text-xs text-gray-200">{formatTimeAgo(message.time)}</div>
      </div>
    </div>
    </>
  );
};

export default MessageCard;
