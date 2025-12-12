import { Pool, PoolClient, QueryResult } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const query = async (queryText: string, values: any[] = []): Promise<QueryResult<any>> => {
  return pool.query(queryText, values);
};

// https://node-postgres.com/features/transactions
export const runInTransaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
