// Store server-side em memória

export interface Player {
  id: string;
  lobby_id: string;
  slot_number: number;
  player_name: string;
  agent_name: string;
  agent_role: string;
  agent_icon?: string;
  created_at: string;
}

export interface Lobby {
  id: string;
  game_time: string;
  game_time_display?: string;
  password?: string;
  created_at: string;
  players?: Player[];
}

let lobbies: Lobby[] = [];
let players: Player[] = [];

export function getLobbies(): Lobby[] {
  return lobbies.map(lobby => ({
    ...lobby,
    players: players.filter(p => p.lobby_id === lobby.id).sort((a, b) => a.slot_number - b.slot_number)
  }));
}

export function getLobby(id: string): Lobby | null {
  const lobby = lobbies.find(l => l.id === id);
  if (!lobby) return null;
  
  return {
    ...lobby,
    players: players.filter(p => p.lobby_id === id).sort((a, b) => a.slot_number - b.slot_number)
  };
}

export function createLobby(lobby: Omit<Lobby, 'players'>): Lobby {
  const newLobby: Lobby = {
    ...lobby,
    players: []
  };
  
  lobbies.push(newLobby);
  lobbies.sort((a, b) => new Date(a.game_time).getTime() - new Date(b.game_time).getTime());
  
  return newLobby;
}

export function deleteLobby(id: string): boolean {
  const index = lobbies.findIndex(l => l.id === id);
  if (index === -1) return false;
  
  lobbies.splice(index, 1);
  players = players.filter(p => p.lobby_id !== id);
  
  return true;
}

export function addPlayer(player: Player): Player {
  // Remove player existente no mesmo slot
  players = players.filter(p => !(p.lobby_id === player.lobby_id && p.slot_number === player.slot_number));
  
  players.push(player);
  
  return player;
}

export function removePlayer(playerId: string): boolean {
  const index = players.findIndex(p => p.id === playerId);
  if (index === -1) return false;
  
  players.splice(index, 1);
  
  return true;
}
