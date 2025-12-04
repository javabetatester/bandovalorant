// API client para comunicação com as serverless functions
import type { Lobby, Player } from '../types/valorant';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ServerUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerUnavailableError';
  }
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 500) {
        const error = await response.json().catch(() => ({ error: 'Servidor não disponível' }));
        if (error.error && error.error.includes('não está rodando')) {
          throw new ServerUnavailableError(error.error);
        }
      }
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ServerUnavailableError('Servidor backend não está rodando. Execute: npm run dev:server ou npm run dev:all');
    }
    throw error;
  }
}

export async function fetchLobbies(): Promise<Lobby[]> {
  return apiCall<Lobby[]>('/lobbies');
}

export async function fetchLobby(id: string): Promise<Lobby> {
  return apiCall<Lobby>(`/lobbies?id=${id}`);
}

export async function createLobby(gameTime: string, password: string): Promise<Lobby> {
  const today = new Date();
  const [hours, minutes] = gameTime.split(':').map(Number);
  const gameDateTime = new Date(today);
  gameDateTime.setHours(hours, minutes, 0, 0);
  
  if (gameDateTime < today) {
    gameDateTime.setDate(gameDateTime.getDate() + 1);
  }

  return apiCall<Lobby>('/lobbies', {
    method: 'POST',
    body: JSON.stringify({
      game_time: gameDateTime.toISOString(),
      game_time_display: gameTime,
      password: password,
    }),
  });
}

export async function deleteLobby(id: string, password: string): Promise<boolean> {
  const response = await apiCall<{ success: boolean }>('/lobbies?id=' + id, {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
  return response.success;
}

export async function addPlayer(
  lobbyId: string,
  slotNumber: number,
  playerName: string,
  agentName: string,
  agentRole: string,
  agentIcon?: string
): Promise<Player> {
  return apiCall<Player>('/players', {
    method: 'POST',
    body: JSON.stringify({
      lobby_id: lobbyId,
      slot_number: slotNumber,
      player_name: playerName,
      agent_name: agentName,
      agent_role: agentRole,
      agent_icon: agentIcon,
    }),
  });
}

export async function removePlayer(playerId: string): Promise<boolean> {
  const response = await apiCall<{ success: boolean }>(`/players?id=${playerId}`, {
    method: 'DELETE',
  });
  return response.success;
}
