import { query } from "../utils/db";
import { getAccount } from "./accountHandler";

export const withdrawal = async (accountID: string, amount: number) => {
  // Only dispense in $5 bills
  if (amount % 5 !== 0) {
    throw new Error("Amount must be dispensable in $5 bills");
  }

  // One time limit
  if (amount > 200) {
    throw new Error("You may only withdraw up to $200 at a time.");
  }

  const account = await getAccount(accountID);

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

  // Daily limit - last check since it requires a db query
  const transactions = await query(`
    SELECT * FROM transactions
    WHERE account_number = $1 AND type = 'withdrawal' AND created_at >= NOW() - INTERVAL '1 day'`,
    [accountID]
  );
  const dailySum = transactions.rows.reduce((acc, curr) => acc + curr.amount, 0);
  if (dailySum + amount > 400) {
    throw new Error("You can only withdraw up to $400 per day. Try a smaller amount or try again tomorrow.");
  }

  account.amount -= amount;
  const res = await query(`
    UPDATE accounts
    SET amount = $1 
    WHERE account_number = $2`,
    [account.amount, accountID]
  );

  if (res.rowCount === 0) {
    throw new Error("Transaction failed");
  }

  return account;
}

export const deposit = async (accountID: string, amount: number) => {
  if (amount > 1000) {
    throw new Error("You cannot deposit more than $1000 at a time.");
  }

  // Don't allow deposit if it would exceed credit limit
  const account = await getAccount(accountID);
  if (account.type === 'credit') {
    if (account.amount + amount > account.credit_limit) {
      throw new Error("Your balance cannot exceed your credit limit.");
    }
  }

  account.amount += amount;
  const res = await query(`
    UPDATE accounts
    SET amount = $1 
    WHERE account_number = $2`,
    [account.amount, accountID]
  );

  if (res.rowCount === 0) {
    throw new Error("Transaction failed");
  }

  return account;
}