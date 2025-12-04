import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_ReEdh6Lg8PSp@ep-long-surf-ahpe2n82-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

function getConnectionString(): string {
  let connectionString = DATABASE_URL.trim();
  
  if (connectionString.includes('channel_binding')) {
    connectionString = connectionString.replace(/[?&]channel_binding=[^&]*/, '');
    connectionString = connectionString.replace(/channel_binding=[^&]*&/, '');
  }
  
  return connectionString;
}

let sqlInstance: ReturnType<typeof neon> | null = null;

function initializeSql() {
  if (!sqlInstance) {
    try {
      const connectionString = getConnectionString();
      sqlInstance = neon(connectionString);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao criar instância SQL:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
      throw new Error(`Falha ao inicializar conexão SQL: ${errorMessage}`);
    }
  }
  return sqlInstance;
}

export const sql = initializeSql();

export async function initDatabase() {
  try {
    await sql`SELECT 1`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao conectar ao banco de dados:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error constructor:', error.constructor.name);
    }
    throw new Error(`Falha na conexão com o banco de dados: ${errorMessage}`);
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
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao criar tabelas:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
      console.error('Error name:', error.name);
    }
    throw new Error(`Falha ao criar tabelas: ${errorMessage}`);
  }
}
