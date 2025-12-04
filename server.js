// Servidor de desenvolvimento local para as APIs
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Importar o store (simulando serverless)
let lobbies = [];
let players = [];

function getLobbies() {
  return lobbies.map(lobby => ({
    ...lobby,
    players: players.filter(p => p.lobby_id === lobby.id).sort((a, b) => a.slot_number - b.slot_number)
  }));
}

function getLobby(id) {
  const lobby = lobbies.find(l => l.id === id);
  if (!lobby) return null;
  
  return {
    ...lobby,
    players: players.filter(p => p.lobby_id === id).sort((a, b) => a.slot_number - b.slot_number)
  };
}

function createLobby(lobby) {
  const newLobby = { ...lobby, players: [] };
  lobbies.push(newLobby);
  lobbies.sort((a, b) => new Date(a.game_time).getTime() - new Date(b.game_time).getTime());
  return newLobby;
}

function deleteLobby(id) {
  const index = lobbies.findIndex(l => l.id === id);
  if (index === -1) return false;
  lobbies.splice(index, 1);
  players = players.filter(p => p.lobby_id !== id);
  return true;
}

function addPlayer(player) {
  players = players.filter(p => !(p.lobby_id === player.lobby_id && p.slot_number === player.slot_number));
  players.push(player);
  return player;
}

function removePlayer(playerId) {
  const index = players.findIndex(p => p.id === playerId);
  if (index === -1) return false;
  players.splice(index, 1);
  return true;
}

// API Routes
app.get('/api/lobbies', (req, res) => {
  const { id } = req.query;
  
  if (id) {
    const lobby = getLobby(id);
    if (!lobby) return res.status(404).json({ error: 'Lobby não encontrado' });
    return res.json(lobby);
  }
  
  res.json(getLobbies());
});

app.post('/api/lobbies', (req, res) => {
  const { game_time, game_time_display, password } = req.body;
  
  if (!game_time) {
    return res.status(400).json({ error: 'game_time é obrigatório' });
  }

  const newLobby = createLobby({
    id: `lobby-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    game_time,
    game_time_display,
    password,
    created_at: new Date().toISOString()
  });

  res.status(201).json(newLobby);
});

app.delete('/api/lobbies', (req, res) => {
  const { id } = req.query;
  const { password } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do lobby é obrigatório' });
  }

  const lobby = getLobby(id);
  if (!lobby) {
    return res.status(404).json({ error: 'Lobby não encontrado' });
  }

  if (lobby.password && lobby.password !== password) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const deleted = deleteLobby(id);
  if (!deleted) {
    return res.status(500).json({ error: 'Erro ao deletar lobby' });
  }

  res.json({ success: true });
});

app.post('/api/players', (req, res) => {
  const { lobby_id, slot_number, player_name, agent_name, agent_role, agent_icon } = req.body;
  
  if (!lobby_id || !slot_number || !player_name || !agent_name || !agent_role) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  const newPlayer = {
    id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lobby_id,
    slot_number,
    player_name,
    agent_name,
    agent_role,
    agent_icon,
    created_at: new Date().toISOString()
  };

  const player = addPlayer(newPlayer);
  res.status(201).json(player);
});

app.delete('/api/players', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID do player é obrigatório' });
  }

  const deleted = removePlayer(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Player não encontrado' });
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desenvolvimento rodando em http://localhost:${PORT}`);
});

