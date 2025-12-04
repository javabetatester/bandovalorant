import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addPlayer, removePlayer } from './store';
import type { Player } from './types';
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    if (req.method === 'POST') {
      const body = parseBody(req);
      const { lobby_id, slot_number, player_name, agent_name, agent_role, agent_icon } = body;
      
      if (!lobby_id || !slot_number || !player_name || !agent_name || !agent_role) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      const newPlayer: Player = {
        id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        lobby_id,
        slot_number,
        player_name,
        agent_name,
        agent_role,
        agent_icon,
        created_at: new Date().toISOString()
      };

      const player = await addPlayer(newPlayer);
      return res.status(201).json(player);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID do player é obrigatório' });
      }

      const deleted = await removePlayer(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Player não encontrado' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de players:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Stack trace:', errorStack);
    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
  }
}

