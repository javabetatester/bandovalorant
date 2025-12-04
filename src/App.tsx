import { useState, useEffect } from 'react';
import { useValorantAgents } from './hooks/useValorantAgents';
import { useLobbies } from './hooks/useLobbies';
import { LobbyCreator } from './components/LobbyCreator';
import { LobbiesList } from './components/LobbiesList';
import { LobbyEditor } from './components/LobbyEditor';
import { ValorantAgent, Lobby } from './types/valorant';
import { ValorantIcon } from './components/ValorantIcon';

function App() {
  const { agents, loading: agentsLoading } = useValorantAgents();
  const { lobbies, loading: lobbiesLoading, serverAvailable, createLobby, addPlayer, removePlayer, deleteLobby } = useLobbies();
  const [view, setView] = useState<'create' | 'list' | 'edit'>(() => {
    const hash = window.location.hash;
    return hash.match(/^#lobby\/(.+)$/) ? 'edit' : 'create';
  });
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);

  useEffect(() => {
    if (selectedLobby && view === 'edit') {
      const updatedLobby = lobbies.find(l => l.id === selectedLobby.id);
      if (updatedLobby) {
        setSelectedLobby(updatedLobby);
      } else {
        setView('list');
        setSelectedLobby(null);
        window.location.hash = '';
      }
    }
  }, [lobbies, selectedLobby, view]);

  useEffect(() => {
    if (lobbiesLoading) return;

    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#lobby\/(.+)$/);
      
      if (match) {
        const lobbyId = match[1];
        const lobby = lobbies.find(l => l.id === lobbyId);
        if (lobby) {
          setSelectedLobby(lobby);
          setView('edit');
        } else {
          setSelectedLobby(null);
          setView('list');
        }
      } else {
        if (view === 'edit' && !selectedLobby) {
          setView('list');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [lobbies, lobbiesLoading]);

  const handleCreateLobby = async (
    gameTime: string,
    password: string,
    players: Array<{ slotNumber: number; playerName: string; agent: ValorantAgent }>
  ): Promise<Lobby | null> => {
    const lobby = await createLobby(gameTime, password);
    if (lobby) {
      for (const player of players) {
        await addPlayer(
          lobby.id,
          player.slotNumber,
          player.playerName,
          player.agent.displayName,
          player.agent.role.displayName,
          player.agent.displayIcon || player.agent.displayIconSmall
        );
      }
      return lobby;
    }
    return null;
  };

  const handleLobbyClick = (lobby: Lobby) => {
    setSelectedLobby(lobby);
    setView('edit');
    window.location.hash = `lobby/${lobby.id}`;
  };

  const handleBackFromEdit = () => {
    setSelectedLobby(null);
    setView('list');
    window.location.hash = '';
  };

  if (agentsLoading || lobbiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-red-500 font-bold text-xl uppercase tracking-wider">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzJhMmEyYSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <div className="relative z-10">
        <header className="border-b border-red-500/20 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <ValorantIcon className="w-10 h-10 sm:w-16 sm:h-16" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-wider">
                  <span className="text-red-500">VALORANT</span> <span className="hidden xs:inline">LOBBY</span> DO BANDO
                </h1>
              </div>
              <p className="text-gray-400 uppercase tracking-widest text-xs sm:text-sm px-2">
                <span className="hidden sm:inline">Organize o bando • Selecione Seus Agentes • Domine os simeos</span>
                <span className="sm:hidden">Crie Times • Selecione Agentes</span>
              </p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setView('create');
                  setSelectedLobby(null);
                  window.location.hash = '';
                }}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold uppercase tracking-wider transition-all text-xs sm:text-sm hover:scale-105 ${
                  view === 'create'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setView('list');
                  setSelectedLobby(null);
                  window.location.hash = '';
                }}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold uppercase tracking-wider transition-all text-xs sm:text-sm hover:scale-105 ${
                  view === 'list' && !selectedLobby
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Ver ({lobbies.length})
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {!serverAvailable && (
            <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-wider mb-1">
                    Servidor Backend Não Disponível
                  </h3>
                  <p className="text-yellow-400 text-sm">
                    O servidor backend não está rodando. Para iniciar, execute em outro terminal:
                  </p>
                  <code className="block mt-2 p-2 bg-black/50 rounded text-yellow-300 text-xs font-mono">
                    npm run dev:server
                  </code>
                  <p className="text-yellow-400 text-xs mt-2">
                    Ou use <code className="bg-black/50 px-1 rounded">npm run dev:all</code> para iniciar tudo junto.
                  </p>
                </div>
              </div>
            </div>
          )}
          {view === 'create' ? (
            <LobbyCreator agents={agents} onCreateLobby={handleCreateLobby} />
          ) : view === 'edit' && selectedLobby ? (
            <LobbyEditor
              lobby={selectedLobby}
              agents={agents}
              onAddPlayer={addPlayer}
              onRemovePlayer={removePlayer}
              onDeleteLobby={async (lobbyId: string, password: string) => {
                return await deleteLobby(lobbyId, password);
              }}
              onBack={handleBackFromEdit}
            />
          ) : (
            <LobbiesList lobbies={lobbies} onLobbyClick={handleLobbyClick} />
          )}
        </main>

        <footer className="border-t border-red-500/20 bg-black/30 backdrop-blur-sm mt-8 sm:mt-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 text-center">
            <p className="text-gray-500 text-xs sm:text-sm uppercase tracking-wider">
              UM BANDO ORGANIZADO • SE TORNA O SUPER BANDO
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
