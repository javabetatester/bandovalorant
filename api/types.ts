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
