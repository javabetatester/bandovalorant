import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_ReEdh6Lg8PSp@ep-long-surf-ahpe2n82-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!connectionString) {
  throw new Error('DATABASE_URL não está configurada');
}

export const sql = neon(connectionString);

export async function initDatabase() {
  try {
    await sql`SELECT 1`;
    
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
    console.error('Erro ao inicializar banco de dados:', error);
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error;
  }
}
