import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { Lobby, Player } from '../types/valorant';
import * as api from '../lib/api';

interface LobbiesContextType {
  lobbies: Lobby[];
  loading: boolean;
  serverAvailable: boolean;
  createLobby: (gameTime: string, password: string) => Promise<Lobby | null>;
  addPlayer: (lobbyId: string, slotNumber: number, playerName: string, agentName: string, agentRole: string, agentIcon?: string) => Promise<Player | null>;
  removePlayer: (playerId: string) => Promise<boolean>;
  deleteLobby: (lobbyId: string, password: string) => Promise<boolean>;
}

const LobbiesContext = createContext<LobbiesContextType | undefined>(undefined);

export function LobbiesProvider({ children }: { children: ReactNode }) {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(true);
  const consecutiveErrorsRef = useRef(0);

  const fetchLobbies = useCallback(async () => {
    try {
      const lobbiesData = await api.fetchLobbies();
      setLobbies(lobbiesData);
      setServerAvailable(true);
      consecutiveErrorsRef.current = 0;
    } catch (error: any) {
      if (error?.name === 'ServerUnavailableError' || error?.message?.includes('não está rodando')) {
        setServerAvailable(false);
        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current === 1) {
          console.error('Servidor backend não está disponível:', error.message);
        }
      } else {
        console.error('Erro ao buscar lobbies:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLobbies();
    
    if (!serverAvailable) {
      return;
    }
    
    const interval = setInterval(() => {
      if (serverAvailable) {
        fetchLobbies();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchLobbies, serverAvailable]);

  const createLobbyHandler = useCallback(async (gameTime: string, password: string): Promise<Lobby | null> => {
    try {
      const newLobby = await api.createLobby(gameTime, password);
      await fetchLobbies();
      return newLobby;
    } catch (error) {
      console.error('Erro ao criar lobby:', error);
      return null;
    }
  }, [fetchLobbies]);

  const addPlayerHandler = useCallback(async (
    lobbyId: string,
    slotNumber: number,
    playerName: string,
    agentName: string,
    agentRole: string,
    agentIcon?: string
  ): Promise<Player | null> => {
    try {
      const newPlayer = await api.addPlayer(lobbyId, slotNumber, playerName, agentName, agentRole, agentIcon);
      await fetchLobbies();
      return newPlayer;
    } catch (error) {
      console.error('Erro ao adicionar player:', error);
      return null;
    }
  }, [fetchLobbies]);

  const removePlayerHandler = useCallback(async (playerId: string): Promise<boolean> => {
    try {
      const success = await api.removePlayer(playerId);
      if (success) {
        await fetchLobbies();
      }
      return success;
    } catch (error) {
      console.error('Erro ao remover player:', error);
      return false;
    }
  }, [fetchLobbies]);

  const deleteLobbyHandler = useCallback(async (lobbyId: string, password: string): Promise<boolean> => {
    try {
      const success = await api.deleteLobby(lobbyId, password);
      if (success) {
        await fetchLobbies();
      }
      return success;
    } catch (error) {
      console.error('Erro ao deletar lobby:', error);
      return false;
    }
  }, [fetchLobbies]);

  return (
    <LobbiesContext.Provider value={{
      lobbies,
      loading,
      serverAvailable,
      createLobby: createLobbyHandler,
      addPlayer: addPlayerHandler,
      removePlayer: removePlayerHandler,
      deleteLobby: deleteLobbyHandler
    }}>
      {children}
    </LobbiesContext.Provider>
  );
}

export function useLobbiesContext() {
  const context = useContext(LobbiesContext);
  if (context === undefined) {
    throw new Error('useLobbiesContext must be used within a LobbiesProvider');
  }
  return context;
}
