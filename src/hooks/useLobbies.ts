import { useLobbiesContext } from '../context/LobbiesContext';
import { Lobby, Player } from '../types/valorant';

export function useLobbies() {
  const context = useLobbiesContext();

  const createLobby = async (gameTime: string, password: string): Promise<Lobby | null> => {
    return context.createLobby(gameTime, password);
  };

  const addPlayer = async (
    lobbyId: string,
    slotNumber: number,
    playerName: string,
    agentName: string,
    agentRole: string,
    agentIcon?: string
  ): Promise<Player | null> => {
    return context.addPlayer(lobbyId, slotNumber, playerName, agentName, agentRole, agentIcon);
  };

  const removePlayer = async (playerId: string): Promise<boolean> => {
    return context.removePlayer(playerId);
  };

  const deleteLobby = async (lobbyId: string, password: string): Promise<boolean> => {
    return context.deleteLobby(lobbyId, password);
  };

  const refetch = async () => {
    return Promise.resolve();
  };

  return {
    lobbies: context.lobbies,
    loading: context.loading,
    serverAvailable: context.serverAvailable,
    createLobby,
    addPlayer,
    removePlayer,
    deleteLobby,
    refetch
  };
}