export interface ValorantAgent {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
  displayIconSmall: string;
  bustPortrait: string;
  fullPortrait: string;
  killfeedPortrait: string;
  background: string;
  backgroundGradientColors: string[];
  role: {
    uuid: string;
    displayName: string;
    description: string;
    displayIcon: string;
  };
  abilities: Array<{
    slot: string;
    displayName: string;
    description: string;
    displayIcon: string;
  }>;
}

export interface ValorantApiResponse {
  status: number;
  data: ValorantAgent[];
}

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
