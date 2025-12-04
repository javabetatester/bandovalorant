import { Clock, Users } from 'lucide-react';
import { Lobby } from '../types/valorant';

interface LobbiesListProps {
  lobbies: Lobby[];
  onLobbyClick: (lobby: Lobby) => void;
}

export function LobbiesList({ lobbies, onLobbyClick }: LobbiesListProps) {
  if (lobbies.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto text-gray-700 mb-4" size={48} />
        <p className="text-gray-500 text-lg">Nenhum lobby criado ainda</p>
        <p className="text-gray-600 text-sm mt-2">Crie o primeiro lobby para começar!</p>
      </div>
    );
  }

  const formatTime = (lobby: Lobby) => {
    if (lobby.game_time_display) {
      return lobby.game_time_display;
    }
    const date = new Date(lobby.game_time);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Duelist': 'bg-red-600',
      'Controller': 'bg-blue-600',
      'Initiator': 'bg-yellow-600',
      'Sentinel': 'bg-green-600',
    };
    return colors[role] || 'bg-gray-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-red-500 font-semibold text-sm uppercase tracking-wider mb-6 border-l-4 border-red-500 pl-3">
        <Clock size={18} />
        Lobbies Ativos
      </div>

      <div className="grid gap-3 sm:gap-4">
        {lobbies.map(lobby => (
          <button
            key={lobby.id}
            onClick={() => onLobbyClick(lobby)}
            className="bg-gradient-to-br from-gray-900/80 to-black border-2 border-gray-700 hover:border-red-500/50 rounded-lg p-3 sm:p-4 md:p-5 transition-all text-left group w-full hover:shadow-lg hover:shadow-red-500/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                  <Clock size={14} className="text-red-500 flex-shrink-0" />
                  <span className="font-bold text-lg sm:text-xl md:text-2xl">{formatTime(lobby)}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {lobby.players?.length || 0}/5 Jogadores
                  </span>
                </div>

                {lobby.players && lobby.players.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {lobby.players.map(player => (
                      <div
                        key={player.id}
                        className="flex items-center gap-1.5 sm:gap-2 bg-black/40 rounded px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-700 hover:border-red-500/50 transition-colors"
                      >
                        {player.agent_icon && (
                          <img
                            src={player.agent_icon}
                            alt={player.agent_name}
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className="text-white text-xs sm:text-sm font-semibold whitespace-nowrap">{player.player_name}</span>
                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${getRoleColor(player.agent_role)} text-white font-semibold whitespace-nowrap`}>
                          {player.agent_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex-shrink-0 ${
                lobby.players?.length === 5
                  ? 'bg-green-600 text-white'
                  : 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/30'
              } font-bold text-xs sm:text-sm uppercase tracking-wider text-center`}>
                {lobby.players?.length === 5 ? 'Cheio' : 'Aberto'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}