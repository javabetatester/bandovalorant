import { neon } from '@neondatabase/serverless';

function getConnectionString(): string {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL não está configurada');
  }

  let connectionString = dbUrl;
  
  if (connectionString.includes('-pooler')) {
    connectionString = connectionString.replace('-pooler', '');
  }
  
  if (connectionString.includes('channel_binding')) {
    connectionString = connectionString.replace(/[?&]channel_binding=[^&]*/, '');
    connectionString = connectionString.replace(/channel_binding=[^&]*&/, '');
  }
  
  return connectionString;
}

const connectionString = getConnectionString();

export const sql = neon(connectionString);

export async function initDatabase() {
  try {
    await sql`SELECT 1`;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Connection string (sem senha):', connectionString.replace(/:[^:@]+@/, ':****@'));
    }
    throw new Error(`Falha na conexão com o banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS lobbies (
        id TEXT PRIMARY KEY,
        game_time TIMESTAMP NOT NULL,
        game_time_display TEXT,
        password TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        lobby_id TEXT NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
        slot_number INTEGER NOT NULL,
        player_name TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        agent_role TEXT NOT NULL,
        agent_icon TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(lobby_id, slot_number)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_players_lobby_id ON players(lobby_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_lobbies_game_time ON lobbies(game_time)
    `;
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error;
  }
}
