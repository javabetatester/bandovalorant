import { useState } from 'react';
import { Users, Target, ArrowLeft, Trash2, Lock } from 'lucide-react';
import { ValorantAgent, Lobby, Player } from '../types/valorant';
import { SlotCard } from './SlotCard';
import { AgentSelector } from './AgentSelector';

interface LobbyEditorProps {
  lobby: Lobby;
  agents: ValorantAgent[];
  onAddPlayer: (lobbyId: string, slotNumber: number, playerName: string, agentName: string, agentRole: string, agentIcon?: string) => Promise<Player | null>;
  onRemovePlayer: (playerId: string) => Promise<boolean>;
  onDeleteLobby: (lobbyId: string, password: string) => Promise<boolean>;
  onBack: () => void;
}

export function LobbyEditor({ lobby, agents, onAddPlayer, onRemovePlayer, onDeleteLobby, onBack }: LobbyEditorProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [currentStep, setCurrentStep] = useState<'name' | 'agent'>('name');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(false);

  const handleSlotClick = (slotNumber: number) => {
    const existingPlayer = lobby.players?.find(p => p.slot_number === slotNumber);
    if (existingPlayer) {
      setSelectedSlot(slotNumber);
      setPlayerNameInput(existingPlayer.player_name);
      setCurrentStep('agent');
      setShowAgentSelector(true);
    } else {
      setSelectedSlot(slotNumber);
      setPlayerNameInput('');
      setCurrentStep('name');
    }
  };

  const handleNameSubmit = () => {
    if (playerNameInput.trim()) {
      setCurrentStep('agent');
      setShowAgentSelector(true);
    }
  };

  const handleAgentSelect = async (agent: ValorantAgent) => {
    if (selectedSlot !== null && playerNameInput.trim()) {
      await onAddPlayer(
        lobby.id,
        selectedSlot,
        playerNameInput.trim(),
        agent.displayName,
        agent.role.displayName,
        agent.displayIcon || agent.displayIconSmall
      );

      setShowAgentSelector(false);
      setSelectedSlot(null);
      setPlayerNameInput('');
      setCurrentStep('name');
    }
  };

  const handleRemovePlayer = async (slotNumber: number) => {
    const player = lobby.players?.find(p => p.slot_number === slotNumber);
    if (player) {
      await onRemovePlayer(player.id);
    }
  };

  const handleDeleteLobby = async () => {
    const success = await onDeleteLobby(lobby.id, deletePassword);
    if (success) {
      setShowDeleteConfirm(false);
      setDeletePassword('');
      setDeleteError(false);
      onBack();
    } else {
      setDeleteError(true);
      setDeletePassword('');
    }
  };

  const getPlayerForSlot = (slotNumber: number): Player | null => {
    return lobby.players?.find(p => p.slot_number === slotNumber) || null;
  };

  const formatTime = () => {
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

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold uppercase tracking-wider text-sm">Voltar</span>
        </button>
        <div className="bg-gradient-to-br from-gray-900/80 to-black border-2 border-red-500/30 rounded-lg p-4 sm:p-5 md:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Lobby - <span className="text-red-500">{formatTime()}</span>
              </h2>
              <p className="text-gray-400 text-sm">
                {lobby.players?.length || 0}/5 Jogadores
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors border border-red-600/30"
            >
              <Trash2 size={18} />
              <span className="text-sm font-semibold uppercase tracking-wider">Deletar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/80 to-black border-2 border-red-500/30 rounded-lg overflow-hidden backdrop-blur-sm">
        <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3 border border-gray-800">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-red-500" />
              <span className="text-white font-semibold uppercase tracking-wider text-sm">
                Jogadores: <span className="text-red-500">{lobby.players?.length || 0}/5</span>
              </span>
            </div>
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
                      player={player}
                      onJoinClick={() => handleSlotClick(slotNumber)}
                      onRemoveClick={() => handleRemovePlayer(slotNumber)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {lobby.players?.length === 5 && (
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-white font-bold text-lg uppercase tracking-wider">
                <Target size={20} />
                Time Completo! Pronto para Dominar!
              </div>
            </div>
          )}
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-500 font-bold text-xl uppercase tracking-wider">
                <Trash2 size={24} />
                Deletar Lobby?
              </div>
              <p className="text-white text-sm">
                Digite a senha do lobby para confirmar a exclusão. Esta ação não pode ser desfeita.
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-red-500 font-semibold text-sm uppercase tracking-wider">
                  <Lock size={18} />
                  Senha do Lobby
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteLobby()}
                  placeholder="Digite a senha"
                  autoFocus
                  className={`w-full bg-black/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    deleteError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-700 focus:border-red-500'
                  }`}
                />
                {deleteError && (
                  <p className="text-red-500 text-sm">Senha incorreta. Tente novamente.</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteLobby}
                  disabled={!deletePassword.trim()}
                  className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${
                    deletePassword.trim()
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Deletar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setDeleteError(false);
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
    </div>
  );
}
