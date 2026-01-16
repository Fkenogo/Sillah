
import React from 'react';

interface PostReactionsProps {
  reactions: Record<string, string[]>;
  userName: string;
  onReact: (emoji: string) => void;
  onReplyClick?: () => void;
}

export const PostReactions: React.FC<PostReactionsProps> = ({ reactions, userName, onReact, onReplyClick }) => {
  const reactionTypes = [
    { emoji: '🙏', label: 'Praying', color: 'siilah-sage' },
    { emoji: '🙌', label: 'Amen', color: 'siilah-gold' },
    { emoji: '🤍', label: 'Support', color: 'siilah-clay' },
    { emoji: '✨', label: 'Inspired', color: 'siilah-olive' }
  ];

  return (
    <div className="flex items-center gap-1">
      {reactionTypes.map((type) => {
        const users = reactions[type.emoji] || [];
        const isActive = users.includes(userName);
        return (
          <button
            key={type.label}
            onClick={() => onReact(type.emoji)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all group relative ${
              isActive ? 'bg-siilah-sage/5' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`text-xl mb-1 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'}`}>
              {type.emoji}
            </span>
            <span className={`text-[8px] font-bold uppercase tracking-widest ${
              isActive ? 'text-siilah-sage' : 'text-gray-300'
            }`}>
              {type.label}
            </span>
            {users.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold border border-white ${
                isActive ? 'bg-siilah-sage text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {users.length}
              </span>
            )}
          </button>
        );
      })}
      
      <div className="w-px h-6 bg-gray-100 mx-2 hidden sm:block"></div>
      
      <button 
        onClick={onReplyClick}
        className="ml-2 text-gray-400 hover:text-siilah-slate text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 bg-gray-50 hover:bg-siilah-sage/5 rounded-full transition-all border border-transparent hover:border-siilah-sage/10"
      >
        Reply
      </button>
    </div>
  );
};
