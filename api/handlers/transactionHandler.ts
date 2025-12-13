import { query, runInTransaction } from "../utils/db";
import { PoolClient } from "pg";

export enum TransactionType {
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
}

/**
 * Transactional read of an account that locks the row for updating.
 */
export const getAccountForUpdate = async (accountID: string, client: PoolClient) => {
  const res = await client.query(`
    SELECT account_number, name, amount, type, credit_limit 
    FROM accounts 
    WHERE account_number = $1
    FOR UPDATE`, // lock the row 
    [accountID]
  );

  if (res.rowCount === 0) {
    throw new Error("Account not found or locked");
  }

  return res.rows[0];
};

// Withdrawal cap logic is implemented as 24 hour rolling window
export const withdrawal = async (accountID: string, amount: number) => {
  if (amount <= 0 || isNaN(amount)) {
    throw new Error("Amount must be greater than 0");
  }

  // Only dispense in $5 bills
  if (amount % 5 !== 0) {
    throw new Error("Amount must be dispensable in $5 bills");
  }

  // One time limit
  if (amount > 200) {
    throw new Error("You may only withdraw up to $200 at a time.");
  }

  // Use a transaction when we are accessing the db
  const updatedAccount = await runInTransaction(async (client: PoolClient) => {
    const account = await getAccountForUpdate(accountID, client);

    // Check if account has enough funds
    if (account.type === 'credit') {
      const newAmount = account.amount - amount;
      if (newAmount < -account.credit_limit) {
        throw new Error("You cannot withdraw more than your credit limit.");
      }
    } else {
      if (account.amount < amount) {
        throw new Error("You do not have enough funds to withdraw this amount.");
      }
    }

    // Check daily limit 
    const dailyWithdrawals = await client.query(`
    SELECT * FROM transactions
    WHERE account_number = $1 AND type = 'withdrawal' AND created_at >= NOW() - INTERVAL '1 day'`,
      [accountID]
    );
    const dailyWithdrawalSum = dailyWithdrawals.rows.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);
    if (dailyWithdrawalSum + amount > 400) {
      throw new Error("You can only withdraw up to $400 per day. Try a smaller amount or try again tomorrow.");
    }

    account.amount -= amount;

    // Update the account 
    const accountUpdate = await client.query(`
        UPDATE accounts
        SET amount = $1 
        WHERE account_number = $2
    `, [account.amount, accountID]);

    if (accountUpdate.rowCount === 0) {
      // Rollback DB transaction
      throw new Error(`Account ${accountID} not found or update failed.`);
    }

    // Insert the transaction
    await client.query(`
        INSERT INTO transactions (account_number, amount, type, created_at)
        VALUES ($1, $2, $3, NOW())
    `, [accountID, amount, TransactionType.WITHDRAWAL]);

    return account;
  });

  return updatedAccount;
}

export const deposit = async (accountID: string, amount: number) => {
  if (amount <= 0 || isNaN(amount)) {
    throw new Error("Amount must be greater than 0");
  }

  if (amount > 1000) {
    throw new Error("You cannot deposit more than $1000 at a time.");
  }

  // Use a transaction when we are accessing the db
  const updatedAccount = await runInTransaction(async (client: PoolClient) => {
    const account = await getAccountForUpdate(accountID, client);

    // If this is a credit account, cannot deposit more than is needed to 0 out the account.
    if (account.type === 'credit') {
      if (account.amount + amount > 0) {
        throw new Error("You cannot deposit more than is needed to 0 out your account.");
      }
    }

    account.amount += amount;

    // Update the account 
    const accountUpdate = await client.query(`
        UPDATE accounts
        SET amount = $1 
        WHERE account_number = $2
    `, [account.amount, accountID]);

    if (accountUpdate.rowCount === 0) {
      // Rollback DB transaction
      throw new Error(`Account ${accountID} not found or update failed.`);
    }

    // Insert the transaction
    await client.query(`
        INSERT INTO transactions (account_number, amount, type, created_at)
        VALUES ($1, $2, $3, NOW())
    `, [accountID, amount, TransactionType.DEPOSIT]);
    return account;
  });

  return updatedAccount;
}

export const dailyWithdrawalTotal = async (accountID: string) => {
  const result = await query(`
    SELECT SUM(amount) as daily_withdrawal_amount
    FROM transactions
    WHERE account_number = $1 AND type = 'withdrawal'
    AND created_at >= NOW() - INTERVAL '1 day'
  `, [accountID]);
  return result.rows[0]?.daily_withdrawal_amount || 0;
}