import { UserPlus, X } from 'lucide-react';
import { Player } from '../types/valorant';
import { translateRole } from '../utils/translations';

interface SlotCardProps {
  slotNumber: number;
  player: Player | null;
  onJoinClick: () => void;
  onRemoveClick?: () => void;
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    'Duelist': 'from-red-600 to-red-900',
    'Controller': 'from-blue-600 to-blue-900',
    'Initiator': 'from-yellow-600 to-yellow-900',
    'Sentinel': 'from-green-600 to-green-900',
  };
  return colors[role] || 'from-gray-600 to-gray-900';
};

export function SlotCard({ slotNumber, player, onJoinClick, onRemoveClick }: SlotCardProps) {
  if (player) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black border-2 border-gray-700 rounded-lg overflow-hidden group hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${getRoleColor(player.agent_role)} opacity-20`}></div>
        <div className="relative p-3 sm:p-4 h-full flex flex-col">
          <div className="absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm z-10 shadow-lg">
            {slotNumber}
          </div>
          {onRemoveClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveClick();
              }}
              className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-600/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white z-10 transition-colors group/remove hover:scale-110"
              title="Remover ou trocar jogador"
            >
              <X size={14} className="group-hover/remove:scale-110 transition-transform" />
            </button>
          )}
          <button
            onClick={onJoinClick}
            className="mt-8 sm:mt-10 flex-1 flex flex-col items-center justify-center text-center gap-2 w-full"
          >
            {player.agent_icon && (
              <img
                src={player.agent_icon}
                alt={player.agent_name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-wide break-words px-1">
              {player.player_name.toUpperCase()}
            </h3>
            <div className={`mt-1 px-2 sm:px-3 py-1 bg-gradient-to-r ${getRoleColor(player.agent_role)} rounded text-white text-xs sm:text-sm font-semibold`}>
              {player.agent_name.toUpperCase()}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">{translateRole(player.agent_role)}</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onJoinClick}
      className="relative bg-gradient-to-br from-gray-900/50 to-black border-2 border-dashed border-gray-700 rounded-lg overflow-hidden hover:border-red-500 transition-all group h-full w-full hover:shadow-lg hover:shadow-red-500/10"
    >
      <div className="p-3 sm:p-4 h-full flex flex-col items-center justify-center">
        <div className="absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm group-hover:bg-red-600 group-hover:text-white transition-colors z-10">
          {slotNumber}
        </div>
        <UserPlus className="text-red-500 mb-2 group-hover:scale-110 transition-transform w-6 h-6 sm:w-8 sm:h-8" size={32} />
        <span className="text-gray-400 font-semibold text-xs sm:text-sm uppercase tracking-wider group-hover:text-red-500 transition-colors px-2 text-center">
          Entrar no Slot
        </span>
      </div>
    </button>
  );
}