'use client';

import React, { useState, useEffect, useRef, JSX } from 'react';
import MessageCard from '../components/Messagecard';
import MessageInput from '../components/MessageInput';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config'; // Adjust the import based on your Firebase config file
import ChatHeader from './ChatHeader';

// Types
interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  status?: string;
}

interface Chatroom {
  id: string;
  myData: User;
  otherData: User;
}

interface Message {
  id: string;
  chatRoomId: string;
  sender: string;
  content: string;
  time: any; // can be Timestamp | null
  image?: string;
}

interface ChatRoomProps {
  user: User;
  selectedChatroom: Chatroom;
}

function ChatRoom({ user, selectedChatroom }: ChatRoomProps): JSX.Element {
  const me = selectedChatroom?.myData;
  const other = selectedChatroom?.otherData;
  const chatRoomId = selectedChatroom?.id;
  console.log(me,"meeeee")

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Get messages from Firestore
  useEffect(() => {
    if (!chatRoomId) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'messages'),
        where('chatRoomId', '==', chatRoomId),
        orderBy('time', 'asc')
      ),
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        console.log(messagesData, 'messagesData');
        setMessages(messagesData);
      }
    );

    return unsubscribe;
  }, [chatRoomId]);

  // Send message to Firestore
  const sendMessage = async () => {
    if (message.trim() === '' && !image) return;

    try {
      const newMessage = {
        chatRoomId: chatRoomId,
        sender: me.id,
        content: message,
        time: serverTimestamp(),
        image: image || null,
      };

      await addDoc(collection(db, 'messages'), newMessage);
      await updateDoc(doc(db, 'chatrooms', chatRoomId), {
        lastMessage: message || 'Image',
        timestamp: serverTimestamp(),
      });

      setMessage('');
      setImage(null);

      // Scroll after sending
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    } catch (error: any) {
      console.error('Error sending message:', error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen">
    <ChatHeader user={other} />
    
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-10">
      {/* Sort messages by time (latest first) */}
      {[...messages]
        .sort((a, b) => {
          const timeA = a.time ? new Date(a.time).getTime() : 0;
          const timeB = b.time ? new Date(b.time).getTime() : 0;
          return timeB - timeA;
        })
        .map((msg) => (
          <MessageCard key={msg.id} message={msg} me={me} other={other} />
        ))}
    </div>

  

      <MessageInput
        sendMessage={sendMessage}
        message={message}  
        setMessage={setMessage}
        image={image}
        setImage={setImage}
      />
    </div>
  );
}

export default ChatRoom;
