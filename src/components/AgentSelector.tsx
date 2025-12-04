import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { ValorantAgent } from '../types/valorant';
import { translateRole } from '../utils/translations';

interface AgentSelectorProps {
  agents: ValorantAgent[];
  onSelect: (agent: ValorantAgent) => void;
  onClose: () => void;
}

type Role = 'ALL' | 'Duelist' | 'Controller' | 'Initiator' | 'Sentinel';

const roleLabels: Record<Role, string> = {
  'ALL': 'TODOS',
  'Duelist': 'DUELISTA',
  'Controller': 'CONTROLADOR',
  'Initiator': 'INICIADOR',
  'Sentinel': 'SENTINELA'
};

export function AgentSelector({ agents, onSelect, onClose }: AgentSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesRole = selectedRole === 'ALL' || agent.role.displayName === selectedRole;
      const matchesSearch = agent.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [agents, selectedRole, searchQuery]);

  const roles: Role[] = ['ALL', 'Duelist', 'Controller', 'Initiator', 'Sentinel'];

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Duelist': 'from-red-600 to-red-800',
      'Controller': 'from-blue-600 to-blue-800',
      'Initiator': 'from-yellow-600 to-yellow-800',
      'Sentinel': 'from-green-600 to-green-800',
    };
    return colors[role] || 'from-gray-600 to-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 rounded-lg max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-3 sm:p-4 md:p-6 border-b border-red-500/30 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-red-600/10 to-black">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 tracking-wider">SELECIONE SEU AGENTE</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 hover:scale-110"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" size={20} />
            <input
              type="text"
              placeholder="Buscar agentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-lg pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm sm:text-base"
            />
          </div>

          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm tracking-wider transition-all hover:scale-105 ${
                  selectedRole === role
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {filteredAgents.map(agent => (
              <button
                key={agent.uuid}
                onClick={() => onSelect(agent)}
                className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-800 hover:border-red-500 transition-all hover:scale-105"
              >
                {agent.displayIcon && (
                  <img
                    src={agent.displayIcon}
                    alt={agent.displayName}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${getRoleColor(agent.role.displayName)} opacity-60 group-hover:opacity-70`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 sm:p-2 z-10">
                  {agent.displayIconSmall && (
                    <img
                      src={agent.displayIconSmall}
                      alt={agent.displayName}
                      className="w-10 h-10 sm:w-12 sm:h-12 mb-1 object-contain drop-shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-white font-bold text-[10px] xs:text-xs sm:text-sm text-center tracking-wide drop-shadow-lg leading-tight">
                    {agent.displayName.toUpperCase()}
                  </span>
                  <span className="text-[9px] xs:text-[10px] text-gray-300 mt-0.5 uppercase tracking-wider">
                    {translateRole(agent.role.displayName)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-0"></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}