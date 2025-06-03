'use client';

import React, { JSX, useEffect, useState, useRef } from 'react';
import { app, db  } from '@/firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc,  collection, query, orderBy, limitToLast, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Users from './components/Users';
import ChatRoom from './components/ChatRoom';
import toast, { Toaster } from 'react-hot-toast';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastGlobalMessageId, setLastGlobalMessageId] = useState<string | null>(null);
  const router = useRouter();

 //Request Notification Permission (
  useEffect(() => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}, []);

  useEffect(() => {
    // Listen to the latest message in all chatrooms
    const q = query(
      collection(db, "messages"),
      orderBy("time", "asc"),
      limitToLast(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs;
      if (!docs.length) return;
      const latest = docs[0].data();
      const latestId = docs[0].id;
      console.log(latest, "latest message12");
      //console.log(latestId, "latest message id")
      // Only notify if it's a new message (not on first load)
      if (
        lastGlobalMessageId &&
        latestId !== lastGlobalMessageId &&
        latest.sender !== user?.id 
      // Don't play sound if sender is the current user
      ) {
        // Play sound
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
          toast('New message received!', {
            position: 'top-center',
            icon: '💬',
          });
        }
        // Show browser notification if not focused
        if (
          document.visibilityState !== "visible" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("New message", {
            body: latest.content || "You have a new message",
            icon: latest.senderAvatarUrl || "/default-avatar.png",
          });
        }
      }
      
      setLastGlobalMessageId(latestId);
    });

    return () => unsubscribe();
  }, [lastGlobalMessageId]);

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
      <audio ref={audioRef} src="/notification/notification-sound.mp3" preload="auto" />
    
    {/* Left side users */}
    <div className="flex-shrink-0 w-3/12">
      <Users userData={user} setSelectedChatroom={(chatroom) => setSelectedChatroom(chatroom)} />
    </div>

    {/* Right side chat room */}
    <div className="flex-grow w-9/12 relative">
      {selectedChatroom ? (
      <>
        <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => setSelectedChatroom(null)}
        >
        ✖
        </button>
        <ChatRoom user={user} selectedChatroom={selectedChatroom} />
      </>
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
