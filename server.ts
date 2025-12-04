import express from 'express';
import cors from 'cors';
import { initDatabase } from './api/db';
import * as store from './api/store';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

app.get('/api/lobbies', async (req, res) => {
  try {
    await ensureDbInitialized();
    const { id } = req.query;
    
    if (id) {
      const lobby = await store.getLobby(id as string);
      if (!lobby) return res.status(404).json({ error: 'Lobby não encontrado' });
      return res.json(lobby);
    }
    
    const lobbies = await store.getLobbies();
    res.json(lobbies);
  } catch (error) {
    console.error('Erro ao buscar lobbies:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/lobbies', async (req, res) => {
  try {
    await ensureDbInitialized();
    const { game_time, game_time_display, password } = req.body;
    
    if (!game_time) {
      return res.status(400).json({ error: 'game_time é obrigatório' });
    }

    const newLobby = await store.createLobby({
      id: `lobby-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      game_time,
      game_time_display,
      password,
      created_at: new Date().toISOString()
    });

    res.status(201).json(newLobby);
  } catch (error) {
    console.error('Erro ao criar lobby:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/lobbies', async (req, res) => {
  try {
    await ensureDbInitialized();
    const { id } = req.query;
    const { password } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID do lobby é obrigatório' });
    }

    const lobby = await store.getLobby(id as string);
    if (!lobby) {
      return res.status(404).json({ error: 'Lobby não encontrado' });
    }

    if (lobby.password && lobby.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const deleted = await store.deleteLobby(id as string);
    if (!deleted) {
      return res.status(500).json({ error: 'Erro ao deletar lobby' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar lobby:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    await ensureDbInitialized();
    const { lobby_id, slot_number, player_name, agent_name, agent_role, agent_icon } = req.body;
    
    if (!lobby_id || !slot_number || !player_name || !agent_name || !agent_role) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const newPlayer = {
      id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      lobby_id,
      slot_number,
      player_name,
      agent_name,
      agent_role,
      agent_icon,
      created_at: new Date().toISOString()
    };

    const player = await store.addPlayer(newPlayer);
    res.status(201).json(player);
  } catch (error) {
    console.error('Erro ao adicionar player:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/players', async (req, res) => {
  try {
    await ensureDbInitialized();
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID do player é obrigatório' });
    }

    const deleted = await store.removePlayer(id as string);
    if (!deleted) {
      return res.status(404).json({ error: 'Player não encontrado' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover player:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desenvolvimento rodando em http://localhost:${PORT}`);
});
