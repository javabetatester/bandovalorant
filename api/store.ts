import { sql } from './db';
import type { Player, Lobby } from './types';

export type { Player, Lobby };

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

  return lobbies.map((lobby: any) => ({
    id: lobby.id,
    game_time: lobby.game_time.toISOString(),
    game_time_display: lobby.game_time_display || null,
    password: lobby.password || null,
    created_at: lobby.created_at.toISOString(),
    players: players
      .filter((p: any) => p.lobby_id === lobby.id)
      .map((p: any) => ({
        id: p.id,
        lobby_id: p.lobby_id,
        slot_number: p.slot_number,
        player_name: p.player_name,
        agent_name: p.agent_name,
        agent_role: p.agent_role,
        agent_icon: p.agent_icon || null,
        created_at: p.created_at.toISOString()
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
    game_time: lobby.game_time.toISOString(),
    game_time_display: lobby.game_time_display || null,
    password: lobby.password || null,
    created_at: lobby.created_at.toISOString(),
    players: players.map((p: any) => ({
      id: p.id,
      lobby_id: p.lobby_id,
      slot_number: p.slot_number,
      player_name: p.player_name,
      agent_name: p.agent_name,
      agent_role: p.agent_role,
      agent_icon: p.agent_icon || null,
      created_at: p.created_at.toISOString()
    }))
  };
}

export async function createLobby(lobby: Omit<Lobby, 'players'>): Promise<Lobby> {
  await sql`
    INSERT INTO lobbies (id, game_time, game_time_display, password, created_at)
    VALUES (${lobby.id}, ${lobby.game_time}, ${lobby.game_time_display || null}, ${lobby.password || null}, ${lobby.created_at})
  `;

  return {
    ...lobby,
    players: []
  };
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
