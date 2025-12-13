import { useState } from "react";
import "./App.css";
import { Alert, Grid } from "@mui/material";
import { SignIn } from "./components/SignIn";
import { AccountDashboard } from "./components/AccountDashboard";
import { Account, AccountData } from "./Types/Account";
import { api } from "./lib/api";

export const App = () => {
  const [accountNumberError, setAccountNumberError] = useState<
    Error | undefined
  >(undefined);
  const [account, setAccount] = useState<Account | undefined>(undefined);

  const signIn = async (accountNumber: number) => {
    try {
      const accountData = await api<AccountData>(`accounts/${accountNumber}`, {
        method: "GET",
      });
      setAccount({
        accountNumber: accountData.account_number,
        name: accountData.name,
        amount: accountData.amount,
        type: accountData.type,
        creditLimit: accountData.credit_limit,
      });
    } catch (error) {
      setAccountNumberError(error as Error);
      setAccount(undefined);
      return;
    }
  };
  const signOut = async () => {
    setAccount(undefined);
  };

  return (
    <div className="app">
      <Grid container>
        <Grid item xs={1} />
        <Grid item xs={10}>
          {account ? (
            <AccountDashboard account={account} signOut={signOut} />
          ) : (
            <SignIn
              signIn={signIn}
              accountNumberError={accountNumberError}
              setAccountNumberError={setAccountNumberError}
            />
          )}
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </div>
  );
};
