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
  increment,
  limit,
  startAfter,
  getDocs,
  endBefore,
  limitToLast,
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
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadMore, setLoadMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
  if (!chatRoomId || !me?.id) return;
  // Reset unread count for current user
  updateDoc(doc(db, 'chatrooms', chatRoomId), {
    [`unreadCounts.${me.id}`]: 0,
  });
}, [chatRoomId, me?.id]);

const fetchMessages = async (initial = false) => {
  if (!chatRoomId) return;
  setLoading(true);

  let q = query(
    collection(db, 'messages'),
    where('chatRoomId', '==', chatRoomId),
    orderBy('time', 'asc'),
    limitToLast(20) // <-- Use limitToLast for initial fetch to get the latest 20 in ascending order
  );

  if (!initial && lastDoc) {
    q = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', chatRoomId),
      orderBy('time', 'asc'),
      endBefore(lastDoc), // <-- Fetch older messages before the first loaded message
      limitToLast(20)
    );
  }

  const snapshot = await getDocs(q);
  const fetchedMessages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Message[];

  if (initial) {
    setMessages(fetchedMessages);
    setLastDoc(snapshot.docs[0]); // The first doc is the oldest
  } else {
    setMessages(prev => [...fetchedMessages, ...prev]); // Prepend older messages
    setLastDoc(snapshot.docs[0]);
  }

  setLoadMore(snapshot.docs.length === 20);
  setLoading(false);
};

// Initial fetch: only fetch once when chatRoomId changes
useEffect(() => {
  if (!chatRoomId) return;

  const q = query(
    collection(db, 'messages'),
    where('chatRoomId', '==', chatRoomId),
    orderBy('time', 'asc'),
    limitToLast(20)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedMessages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    setMessages(fetchedMessages);
    setLastDoc(snapshot.docs[0]);
    setLoadMore(snapshot.docs.length === 20);
  });

  return () => unsubscribe();
}, [chatRoomId]);

// Load more handler: only fetch if there are more messages and not loading
const handleLoadMore = () => {
  if (loadMore && !loading) fetchMessages(false);
};


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
        [`unreadCounts.${other.id}`]: increment(1),
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
       {loadMore && (
      <div className="flex justify-center mb-4">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className={`
            px-6 py-2 rounded-full text-blue-600 font-semibold
            transition-all duration-300 ease-in-out
            hover:underline hover:text-blue-800
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      </div>
       )}
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
