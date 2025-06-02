
"use client";
import React from 'react';

interface User {
    id: string;
    avatarUrl?: string;
    name?: string;
  }

const ChatHeader = ({ user }: { user: User }) => (
    <div className="flex items-center px-4 py-2 bg-gray-100 border-b border-gray-300">
      <img
        src={user.avatarUrl}
        alt="User Avatar"
        className="w-10 h-10 rounded-full object-cover mr-3"
      />
      <span className="text-gray-800 font-medium">{user.name || 'User'}</span>
    </div>
  );

  export default ChatHeader;