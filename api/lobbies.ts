import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLobbies, getLobby, createLobby, deleteLobby, type Lobby } from './store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (id && typeof id === 'string') {
        // Buscar lobby específico
        const lobby = getLobby(id);
        if (!lobby) {
          return res.status(404).json({ error: 'Lobby não encontrado' });
        }
        return res.status(200).json(lobby);
      } else {
        // Listar todos os lobbies
        const lobbies = getLobbies();
        return res.status(200).json(lobbies);
      }
    }

    if (req.method === 'POST') {
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

      return res.status(201).json(newLobby);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const { password } = req.body;

      if (!id || typeof id !== 'string') {
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

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de lobbies:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

