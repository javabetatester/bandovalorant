import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLobbies, getLobby, createLobby, deleteLobby } from './store';
import { initDatabase } from './db';

function parseBody(req: VercelRequest): any {
  if (!req.body) {
    return {};
  }
  
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      console.error('Erro ao parsear body como JSON:', e);
      return {};
    }
  }
  
  if (typeof req.body === 'object') {
    return req.body;
  }
  
  return {};
}

let dbInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!dbInitialized) {
      await initDatabase();
      dbInitialized = true;
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (id && typeof id === 'string') {
        const lobby = await getLobby(id);
        if (!lobby) {
          return res.status(404).json({ error: 'Lobby não encontrado' });
        }
        return res.status(200).json(lobby);
      }
      
      const lobbies = await getLobbies();
      return res.status(200).json(lobbies);
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const { game_time, game_time_display, password } = body;
      
      if (!game_time) {
        return res.status(400).json({ error: 'game_time é obrigatório' });
      }

      const newLobby = await createLobby({
        id: `lobby-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        game_time,
        game_time_display,
        password,
        created_at: new Date().toISOString()
      });

      return res.status(201).json(newLobby);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const body = parseBody(req);
      const { password } = body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID do lobby é obrigatório' });
      }

      const lobby = await getLobby(id);
      if (!lobby) {
        return res.status(404).json({ error: 'Lobby não encontrado' });
      }

      if (lobby.password && lobby.password !== password) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      const deleted = await deleteLobby(id);
      if (!deleted) {
        return res.status(500).json({ error: 'Erro ao deletar lobby' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de lobbies:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Stack trace:', errorStack);
    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
  }
}

