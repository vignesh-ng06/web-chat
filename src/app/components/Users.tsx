'use client';

import { JSX, useEffect, useState } from 'react';
import { db, app } from '@/firebase/config';
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import UsersCard from '../components/UserCard';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  status?: string;
}

interface Chatroom {
  id: string;
  users: string[];
  usersData: Record<string, User>;
  lastMessage?: string | null;
  timestamp?: any; // can be Timestamp | null
}

interface UsersProps {
  userData: User;
  setSelectedChatroom: (chatroom: {
    id: string;
    myData: User;
    otherData: User;
  }) => void;
}

function Users({ userData, setSelectedChatroom }: UsersProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'chatrooms' | 'users'>('chatrooms');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userChatrooms, setUserChatrooms] = useState<Chatroom[]>([]);
  const router = useRouter();
  const auth = getAuth(app);

  const handleTabClick = (tab: 'chatrooms' | 'users') => {
    setActiveTab(tab);
  };

  // Fetch all users
  useEffect(() => {
    setLoading2(true);
    const usersQuery = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      setUsers(usersData);
      setLoading2(false);
    });

    return () => unsubscribe();
  }, []);
  console.log(users, 'userData');

  // Fetch user chatrooms
  useEffect(() => {
    if (!userData?.id) return;
    setLoading(true);

    const chatroomsQuery = query(
      collection(db, 'chatrooms'),
      where('users', 'array-contains', userData.id)
    );

    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
      const chatroomsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chatroom[];

      setUserChatrooms(chatroomsData);
      console.log(chatroomsData, 'chatroomsData');
      setLoading(false);
    });

    return () => unsubscribeChatrooms();
  }, [userData]);

  // Create a new chatroom
  const createChat = async (user: User) => {
    const existingChatroomsQuery = query(
      collection(db, 'chatrooms'),
      where('users', '==', [userData.id, user.id])
    );

    try {
      const snapshot = await getDocs(existingChatroomsQuery);

      if (!snapshot.empty) {
        toast.error('Chatroom already exists for these users.');
        return;
      }

      toast.success('Chatroom created successfully.');

      const usersData = {
        [userData.id]: userData,
        [user.id]: user,
      };

      const chatroomData = {
        users: [userData.id, user.id],
        usersData,
        timestamp: serverTimestamp(),
        lastMessage: null,
      };

      const chatroomRef = await addDoc(collection(db, 'chatrooms'), chatroomData);
      console.log('Chatroom created with ID:', chatroomRef.id);
      setActiveTab('chatrooms');
    } catch (error) {
      console.error('Error creating or checking chatroom:', error);
    }
  };

  // Open chatroom
  const openChat = (chatroom: Chatroom) => {
    const otherUserId = chatroom.users.find((id) => id !== userData.id);
    if (!otherUserId) return;

    const data = {
      id: chatroom.id,
      myData: userData,
      otherData: chatroom.usersData[otherUserId],
    };
    console.log(data, 'dataaaaaaa');

    setSelectedChatroom(data);
  };

  // Logout
  const logoutClick = () => {
    signOut(auth)
      .then(() => {
        toast.success('Logged out successfully');
        router.push('/pages/login');
      })
      .catch((error) => {
        toast.error('Error logging out: ' + error.message);
      });
  };

  return (
    <div className="shadow-lg h-screen overflow-auto mt-4 mb-20">
      <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0">
        <button
          className={`btn btn-outline ${activeTab === 'users' ? 'btn-primary' : ''}`}
          onClick={() => handleTabClick('users')}
        >
          Users
        </button>
        <button
          className={`btn btn-outline ${activeTab === 'chatrooms' ? 'btn-primary' : ''}`}
          onClick={() => handleTabClick('chatrooms')}
        >
          Chatrooms
        </button>
        <button className="btn btn-outline" onClick={logoutClick}>
          Logout
        </button>
      </div>

      <div>
        {activeTab === 'chatrooms' && (
          <>
            <h1 className="px-4 text-base font-semibold">Chatrooms</h1>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : (
              [...userChatrooms]
                .sort((a, b) => {
                  const timeA = a.timestamp?.toDate?.() || new Date(0);
                  const timeB = b.timestamp?.toDate?.() || new Date(0);
                  return timeB.getTime() - timeA.getTime(); // Latest first
                })
                .map((chatroom) => {
                  const otherUserId = chatroom.users.find((id) => id !== userData?.id);
                  const otherUser = chatroom.usersData[otherUserId ?? ''];

                  return (
                    <div key={chatroom.id} onClick={() => openChat(chatroom)}>
                      <UsersCard
                        name={otherUser?.name || 'Unknown'}
                        avatarUrl={otherUser?.avatarUrl || ''}
                        latestMessage={chatroom.lastMessage || 'No Messages Yet'}
                        time={(() => {
                          const timestamp = chatroom.timestamp?.toDate();
                          if (!timestamp) return '';
                          const now = new Date();
                          const isToday = timestamp.toDateString() === now.toDateString();
                          const isYesterday =
                            timestamp.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();

                          if (isToday) {
                            return timestamp.toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true,
                            });
                          } else if (isYesterday) {
                            return 'Yesterday';
                          } else {
                            return timestamp.toLocaleDateString('en-US');
                          }
                        })()}
                        type="chat"
                      />
                    </div>
                  );
                })
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h1 className="mt-4 px-4 text-base font-semibold">Users</h1>
            {loading2 ? (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : (
              users
                .filter((user) => user.id !== userData?.id)
                .map((user) => (
                  <div key={user.id} onClick={() => createChat(user)}>
                    <UsersCard
                      name={user.name}
                      avatarUrl={user.avatarUrl || ''}
                      latestMessage=""
                      type="user"
                    />
                  </div>
                ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Users;
