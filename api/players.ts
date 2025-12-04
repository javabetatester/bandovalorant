import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addPlayer, removePlayer } from './store';
import type { Player } from './types';
import { initDatabase } from './db';

interface PlayerRequestBody {
  lobby_id?: string;
  slot_number?: number;
  player_name?: string;
  agent_name?: string;
  agent_role?: string;
  agent_icon?: string;
}

function parseBody(req: VercelRequest): PlayerRequestBody {
  if (!req.body) {
    return {};
  }
  
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as PlayerRequestBody;
    } catch (e) {
      console.error('Erro ao parsear body como JSON:', e);
      return {};
    }
  }
  
  if (typeof req.body === 'object') {
    return req.body as PlayerRequestBody;
  }
  
  return {};
}

let dbInitialized = false;
let dbInitPromise: Promise<void> | null = null;
let dbInitFailed = false;

async function ensureDatabaseInitialized() {
  if (dbInitialized) {
    return;
  }

  if (dbInitFailed) {
    throw new Error('Inicialização do banco de dados falhou anteriormente');
  }

  if (dbInitPromise) {
    try {
      await dbInitPromise;
      return;
    } catch (error) {
      dbInitPromise = null;
      throw error;
    }
  }

  dbInitPromise = (async () => {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (error) {
      dbInitFailed = true;
      dbInitPromise = null;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Falha ao inicializar banco de dados:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  })();

  try {
    await dbInitPromise;
  } catch (error) {
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureDatabaseInitialized();

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
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro na API de players:', errorMessage);
    
    if (error instanceof Error) {
      console.error('Tipo do erro:', error.constructor.name);
      console.error('Mensagem completa:', errorMessage);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      
      if (error.message.includes('connection') || 
          error.message.includes('conexão') ||
          error.message.includes('banco de dados') ||
          error.message.includes('database')) {
        return res.status(500).json({ 
          error: 'Erro de conexão com o banco de dados',
          message: errorMessage
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: errorMessage
    });
  }
}

