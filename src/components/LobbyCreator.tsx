import { useState } from 'react';
import { Users, Target, Lock } from 'lucide-react';
import { ValorantAgent, Lobby } from '../types/valorant';
import { SlotCard } from './SlotCard';
import { AgentSelector } from './AgentSelector';
import { TimePicker } from './TimePicker';
import { LinkShareModal } from './LinkShareModal';

interface LobbyCreatorProps {
  agents: ValorantAgent[];
  onCreateLobby: (gameTime: string, password: string, players: Array<{ slotNumber: number; playerName: string; agent: ValorantAgent }>) => Promise<Lobby | null>;
}

interface TempPlayer {
  slotNumber: number;
  playerName: string;
  agent: ValorantAgent;
}

export function LobbyCreator({ agents, onCreateLobby }: LobbyCreatorProps) {
  const getDefaultTime = () => {
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const [gameTime, setGameTime] = useState(getDefaultTime());
  const [password, setPassword] = useState('');
  const [players, setPlayers] = useState<TempPlayer[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [currentStep, setCurrentStep] = useState<'name' | 'agent'>('name');
  const [createdLobbyId, setCreatedLobbyId] = useState<string | null>(null);

  const handleSlotClick = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setPlayerNameInput('');
    setCurrentStep('name');
  };

  const handleNameSubmit = () => {
    if (playerNameInput.trim()) {
      setCurrentStep('agent');
      setShowAgentSelector(true);
    }
  };

  const handleAgentSelect = (agent: ValorantAgent) => {
    if (selectedSlot !== null && playerNameInput.trim()) {
      const newPlayer: TempPlayer = {
        slotNumber: selectedSlot,
        playerName: playerNameInput.trim(),
        agent
      };

      setPlayers(prev => {
        const filtered = prev.filter(p => p.slotNumber !== selectedSlot);
        return [...filtered, newPlayer].sort((a, b) => a.slotNumber - b.slotNumber);
      });

      setShowAgentSelector(false);
      setSelectedSlot(null);
      setPlayerNameInput('');
      setCurrentStep('name');
    }
  };

  const handleClear = () => {
    setPlayers([]);
    setGameTime(getDefaultTime());
    setPassword('');
  };

  const handleSubmit = async () => {
    if (gameTime && password.trim()) {
      const lobby = await onCreateLobby(gameTime, password.trim(), players);
      if (lobby) {
        setCreatedLobbyId(lobby.id);
        setPlayers([]);
        setGameTime(getDefaultTime());
        setPassword('');
      }
    }
  };

  const getPlayerForSlot = (slotNumber: number): TempPlayer | null => {
    return players.find(p => p.slotNumber === slotNumber) || null;
  };

  const handleRemovePlayer = (slotNumber: number) => {
    setPlayers(prev => prev.filter(p => p.slotNumber !== slotNumber));
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900/80 to-black border-2 border-red-500/30 rounded-lg overflow-hidden backdrop-blur-sm">
        <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <TimePicker value={gameTime} onChange={setGameTime} />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-red-500 font-semibold text-sm uppercase tracking-wider">
              <Lock size={18} />
              Senha para Deletar Lobby
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite uma senha para proteger o lobby"
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3 border border-gray-800">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-red-500" />
              <span className="text-white font-semibold uppercase tracking-wider text-sm">
                Jogadores: <span className="text-red-500">{players.length}/5</span>
              </span>
            </div>
            {players.length > 0 && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-red-500 text-sm uppercase tracking-wider font-semibold transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-red-500 font-semibold text-sm uppercase tracking-wider mb-4 border-l-4 border-red-500 pl-3">
              <Target size={18} />
              Time
            </div>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5].map(slotNumber => {
                const player = getPlayerForSlot(slotNumber);
                return (
                  <div key={slotNumber} className="aspect-[3/4] w-full">
                    <SlotCard
                      slotNumber={slotNumber}
                      player={player ? {
                        id: '',
                        lobby_id: '',
                        slot_number: player.slotNumber,
                        player_name: player.playerName,
                        agent_name: player.agent.displayName,
                        agent_role: player.agent.role.displayName,
                        agent_icon: player.agent.displayIcon || player.agent.displayIconSmall,
                        created_at: ''
                      } : null}
                      onJoinClick={() => handleSlotClick(slotNumber)}
                      onRemoveClick={() => handleRemovePlayer(slotNumber)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {players.length === 5 && gameTime && (
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-white font-bold text-lg uppercase tracking-wider">
                <Target size={20} />
                Time Completo! Pronto para Dominar!
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!gameTime || !password.trim()}
            className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all ${
              gameTime && password.trim()
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900 shadow-lg shadow-red-500/50 hover:scale-[1.02]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            Criar Lobby
          </button>
        </div>
      </div>

      {selectedSlot !== null && currentStep === 'name' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-500 font-bold text-xl uppercase tracking-wider">
                <Users size={24} />
                Slot {selectedSlot}
              </div>
              <input
                type="text"
                placeholder="Digite seu nome"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                autoFocus
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleNameSubmit}
                  disabled={!playerNameInput.trim()}
                  className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${
                    playerNameInput.trim()
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Próximo
                </button>
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    setPlayerNameInput('');
                    setCurrentStep('name');
                  }}
                  className="px-6 py-3 bg-gray-800 text-gray-400 rounded-lg font-bold uppercase tracking-wider hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAgentSelector && (
        <div className="fixed inset-0 z-50">
          <AgentSelector
            agents={agents}
            onSelect={handleAgentSelect}
            onClose={() => {
              setShowAgentSelector(false);
              setSelectedSlot(null);
              setPlayerNameInput('');
              setCurrentStep('name');
            }}
          />
        </div>
      )}

      {createdLobbyId && (
        <LinkShareModal
          lobbyId={createdLobbyId}
          onClose={() => setCreatedLobbyId(null)}
        />
      )}
    </div>
  );
}
