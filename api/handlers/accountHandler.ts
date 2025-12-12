import { PoolClient, QueryResult } from "pg";
import { query } from "../utils/db";
export interface Account {
  account_number: string;
  name: string;
  amount: number;
  type: 'credit' | 'checking' | 'savings';
  credit_limit: number;
}

export const getAccount = async (accountID: string): Promise<Account> => {
  const res: QueryResult<Account> = await query(`
    SELECT account_number, name, amount, type, credit_limit 
    FROM accounts 
    WHERE account_number = $1`,
    [accountID]
  );

  if (res.rowCount === 0) {
    throw new Error("Account not found");
  }

  return res.rows[0];
};