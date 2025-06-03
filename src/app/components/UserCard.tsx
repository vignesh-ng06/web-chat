import React from 'react';

interface UsersCardProps {
  avatarUrl: string;
  name: string;
  latestMessage?: string;
  time?: string;
  type: 'chat' | 'user';
  unreadcount?: number;
}

const UsersCard: React.FC<UsersCardProps> = ({ avatarUrl, name, latestMessage, time, type , unreadcount }) => {
  return (
    <div className="flex items-center p-4 border-b border-gray-200 relative hover:cursor-pointer">
      {/* Avatar on the left */}
      <div className="flex-shrink-0 mr-4 relative">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img className="w-full h-full object-cover" src={avatarUrl} alt="Avatar" />
        </div>
      </div>

      {type === 'chat' && (
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{name}</h2>
          </div>
          <p className="text-gray-500 truncate">{latestMessage}</p>
          {time && (
            <div className="text-xs text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-end">
              <span>{time}</span>
              {typeof unreadcount === 'number' && unreadcount > 0 && (
          <span className="mt-1 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {unreadcount}
          </span>
              )}
            </div>
          )}
          {/* If no time, show unreadcount in the old position */}
          {!time && typeof unreadcount === 'number' && unreadcount > 0 && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {unreadcount}
            </div>
          )}
        </div>
      )}

      {type === 'user' && (
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{name}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersCard;
