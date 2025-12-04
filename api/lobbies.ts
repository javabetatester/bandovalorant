import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLobbies, getLobby, createLobby, deleteLobby } from './store';
import { initDatabase } from './db';

interface LobbyRequestBody {
  game_time?: string;
  game_time_display?: string;
  password?: string;
}

function parseBody(req: VercelRequest): LobbyRequestBody {
  if (!req.body) {
    return {};
  }
  
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as LobbyRequestBody;
    } catch (e) {
      console.error('Erro ao parsear body como JSON:', e);
      return {};
    }
  }
  
  if (typeof req.body === 'object') {
    return req.body as LobbyRequestBody;
  }
  
  return {};
}

let dbInitialized = false;
let dbInitPromise: Promise<void> | null = null;

async function ensureDatabaseInitialized() {
  if (dbInitialized) {
    return;
  }

  if (dbInitPromise) {
    await dbInitPromise;
    return;
  }

  dbInitPromise = (async () => {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Falha ao inicializar banco de dados:', error);
      dbInitPromise = null;
      throw error;
    }
  })();

  await dbInitPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureDatabaseInitialized();

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
    
    if (error instanceof Error) {
      console.error('Tipo do erro:', error.constructor.name);
      console.error('Mensagem:', error.message);
      console.error('Stack trace:', error.stack);
      
      if (error.message.includes('connection') || error.message.includes('conexão')) {
        return res.status(500).json({ 
          error: 'Erro de conexão com o banco de dados',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Verifique a configuração do banco de dados'
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

