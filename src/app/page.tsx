'use client';

import React, { JSX, useEffect, useState } from 'react';
import { app, db } from '@/firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Users from './components/Users';
import ChatRoom from './components/ChatRoom';

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
  // Add any additional fields your chatroom might have
}

function Page(): JSX.Element {
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as User;
            setUser(data);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      } else {
        setUser(null);
        router.push('pages/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (user === null) {
    return <div className="text-4xl text-center mt-10">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
    {/* Left side users */}
    <div className="flex-shrink-0 w-3/12">
      <Users userData={user} setSelectedChatroom={(chatroom) => setSelectedChatroom(chatroom)} />
    </div>

    {/* Right side chat room */}
    <div className="flex-grow w-9/12">
      {selectedChatroom ? (
        <ChatRoom user={user} selectedChatroom={selectedChatroom} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl text-gray-400">Select a chatroom</div>
        </div>
      )}
    </div>
  </div>
  );
}

export default Page;
