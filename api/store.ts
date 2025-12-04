import { sql } from './db';
import type { Player, Lobby } from './types';

export type { Player, Lobby };

interface LobbyRow {
  id: string;
  game_time: Date | string;
  game_time_display: string | null;
  password: string | null;
  created_at: Date | string;
}

interface PlayerRow {
  id: string;
  lobby_id: string;
  slot_number: number;
  player_name: string;
  agent_name: string;
  agent_role: string;
  agent_icon: string | null;
  created_at: Date | string;
}

function toISOString(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function getLobbies(): Promise<Lobby[]> {
  const lobbies = await sql`
    SELECT 
      id,
      game_time,
      game_time_display,
      password,
      created_at
    FROM lobbies
    ORDER BY game_time ASC
  `;

  const players = await sql`
    SELECT 
      id,
      lobby_id,
      slot_number,
      player_name,
      agent_name,
      agent_role,
      agent_icon,
      created_at
    FROM players
    ORDER BY lobby_id, slot_number
  `;

  return (lobbies as LobbyRow[]).map((lobby) => ({
    id: lobby.id,
    game_time: toISOString(lobby.game_time),
    game_time_display: lobby.game_time_display ?? undefined,
    password: lobby.password ?? undefined,
    created_at: toISOString(lobby.created_at),
    players: (players as PlayerRow[])
      .filter((p) => p.lobby_id === lobby.id)
      .map((p) => ({
        id: p.id,
        lobby_id: p.lobby_id,
        slot_number: p.slot_number,
        player_name: p.player_name,
        agent_name: p.agent_name,
        agent_role: p.agent_role,
        agent_icon: p.agent_icon ?? undefined,
        created_at: toISOString(p.created_at)
      }))
  }));
}

export async function getLobby(id: string): Promise<Lobby | null> {
  const [lobby] = await sql`
    SELECT 
      id,
      game_time,
      game_time_display,
      password,
      created_at
    FROM lobbies
    WHERE id = ${id}
  `;

  if (!lobby) {
    return null;
  }

  const players = await sql`
    SELECT 
      id,
      lobby_id,
      slot_number,
      player_name,
      agent_name,
      agent_role,
      agent_icon,
      created_at
    FROM players
    WHERE lobby_id = ${id}
    ORDER BY slot_number
  `;

  return {
    id: lobby.id,
    game_time: toISOString(lobby.game_time),
    game_time_display: (lobby as LobbyRow).game_time_display ?? undefined,
    password: (lobby as LobbyRow).password ?? undefined,
    created_at: toISOString(lobby.created_at),
    players: (players as PlayerRow[]).map((p) => ({
      id: p.id,
      lobby_id: p.lobby_id,
      slot_number: p.slot_number,
      player_name: p.player_name,
      agent_name: p.agent_name,
      agent_role: p.agent_role,
      agent_icon: p.agent_icon ?? undefined,
      created_at: toISOString(p.created_at)
    }))
  };
}

export async function createLobby(lobby: Omit<Lobby, 'players'>): Promise<Lobby> {
  try {
    await sql`
      INSERT INTO lobbies (id, game_time, game_time_display, password, created_at)
      VALUES (${lobby.id}, ${lobby.game_time}::timestamp, ${lobby.game_time_display || null}, ${lobby.password || null}, ${lobby.created_at}::timestamp)
    `;

    return {
      ...lobby,
      players: []
    };
  } catch (error) {
    console.error('Erro ao criar lobby no banco:', error);
    throw error;
  }
}

export async function deleteLobby(id: string): Promise<boolean> {
  const check = await sql`
    SELECT id FROM lobbies WHERE id = ${id}
  `;
  
  if (!check || (Array.isArray(check) && check.length === 0)) {
    return false;
  }

  await sql`
    DELETE FROM lobbies
    WHERE id = ${id}
  `;

  return true;
}

export async function addPlayer(player: Player): Promise<Player> {
  await sql`
    DELETE FROM players
    WHERE lobby_id = ${player.lobby_id} AND slot_number = ${player.slot_number}
  `;

  await sql`
    INSERT INTO players (id, lobby_id, slot_number, player_name, agent_name, agent_role, agent_icon, created_at)
    VALUES (${player.id}, ${player.lobby_id}, ${player.slot_number}, ${player.player_name}, ${player.agent_name}, ${player.agent_role}, ${player.agent_icon || null}, ${player.created_at})
  `;

  return player;
}

export async function removePlayer(playerId: string): Promise<boolean> {
  const check = await sql`
    SELECT id FROM players WHERE id = ${playerId}
  `;
  
  if (!check || (Array.isArray(check) && check.length === 0)) {
    return false;
  }

  await sql`
    DELETE FROM players
    WHERE id = ${playerId}
  `;

  return true;
}
