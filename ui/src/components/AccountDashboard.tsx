import React, { useState } from "react";
import { account } from "../Types/Account";
import Paper from "@mui/material/Paper/Paper";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
} from "@mui/material";

type AccountDashboardProps = {
  account: account;
  signOut: () => Promise<void>;
};

export const AccountDashboard = (props: AccountDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [account, setAccount] = useState(props.account);
  const [withdrawalError, setWithdrawalError] = useState<string | undefined>(
    undefined
  );
  const [depositError, setDepositError] = useState<string | undefined>(
    undefined
  );

  const { signOut } = props;

  const depositFunds = async () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: depositAmount }),
    };
    try {
      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/deposit`,
        requestOptions
      );
      const data = await response.json();
      if (response.status !== 200) {
        setDepositError(data.error);
        return;
      }
      setDepositError(undefined);
      setAccount({
        accountNumber: data.account_number,
        name: data.name,
        amount: data.amount,
        type: data.type,
        creditLimit: data.credit_limit,
      });
    } catch (error) {
      setDepositError(error as string);
      console.error(error);
    }
  };

  const withdrawFunds = async () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: withdrawAmount }),
    };
    try {
      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/withdraw`,
        requestOptions
      );
      const data = await response.json();
      if (response.status !== 200) {
        setWithdrawalError(data.error);
        return;
      }
      setWithdrawalError(undefined);
      setAccount({
        accountNumber: data.account_number,
        name: data.name,
        amount: data.amount,
        type: data.type,
        creditLimit: data.credit_limit,
      });
    } catch (error) {
      setWithdrawalError(error as string);
      console.error(error);
    }
  };

  return (
    <Paper className="account-dashboard">
      <div className="dashboard-header">
        <h1>Hello, {account.name}!</h1>
        <Button variant="contained" onClick={signOut}>
          Sign Out
        </Button>
      </div>
      <h2>Balance: ${account.amount}</h2>
      <Grid container spacing={2} padding={2}>
        <Grid item xs={6}>
          <Card className="deposit-card">
            <CardContent>
              {depositError && <Alert severity="error">{depositError}</Alert>}
              <h3>Deposit</h3>
              <TextField
                label="Deposit Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: "flex",
                  margin: "auto",
                }}
                onChange={(e) => setDepositAmount(+e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  margin: "auto",
                  marginTop: 2,
                }}
                onClick={depositFunds}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className="withdraw-card">
            <CardContent>
              {withdrawalError && (
                <Alert severity="error">{withdrawalError}</Alert>
              )}
              <h3>Withdraw</h3>
              <TextField
                label="Withdraw Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: "flex",
                  margin: "auto",
                }}
                onChange={(e) => setWithdrawAmount(+e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  margin: "auto",
                  marginTop: 2,
                }}
                onClick={withdrawFunds}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};
