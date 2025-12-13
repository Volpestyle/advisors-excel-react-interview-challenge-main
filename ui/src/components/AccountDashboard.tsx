import React, { useEffect, useState } from "react";
import { Account, AccountData } from "../Types/Account";
import Paper from "@mui/material/Paper/Paper";
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Button,
} from "@mui/material";
import { api } from "../lib/api";

type AccountDashboardProps = {
  account: Account;
  signOut: () => Promise<void>;
};

export const AccountDashboard = (props: AccountDashboardProps) => {
  const [account, setAccount] = useState(props.account);

  // TextField values
  const [depositAmount, setDepositAmount] = useState<number | undefined>(
    undefined
  );
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(
    undefined
  );

  // Error messages
  const [depositError, setDepositError] = useState<Error | undefined>(
    undefined
  );
  const [withdrawalError, setWithdrawalError] = useState<Error | undefined>(
    undefined
  );

  // Success messages
  const [withdrawSuccessMessage, setWithdrawSuccessMessage] = useState<
    string | undefined
  >(undefined);
  const [depositSuccessMessage, setDepositSuccessMessage] = useState<
    string | undefined
  >(undefined);

  const [isLoading, setIsLoading] = useState(false);

  const [withdrawalTotal, setWithdrawalTotal] = useState<number | undefined>(
    undefined
  );

  const resetMessages = () => {
    setWithdrawSuccessMessage(undefined);
    setDepositSuccessMessage(undefined);
    setWithdrawalError(undefined);
    setDepositError(undefined);
  };

  const { signOut } = props;

  useEffect(() => {
    const fetchWithdrawalTotal = async () => {
      const total = await api<number>(
        `transactions/${account.accountNumber}/daily-withdrawal-total`
      );
      setWithdrawalTotal(total);
    };
    fetchWithdrawalTotal();
  }, [account.amount, account.accountNumber]);

  const depositFunds = async () => {
    resetMessages();
    setIsLoading(true);
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: depositAmount }),
    };
    try {
      const accountData = await api<AccountData>(
        `transactions/${account.accountNumber}/deposit`,
        requestOptions
      );
      setAccount({
        accountNumber: accountData.account_number,
        name: accountData.name,
        amount: accountData.amount,
        type: accountData.type,
        creditLimit: accountData.credit_limit,
      });
      setDepositSuccessMessage(`Deposited $${depositAmount} successfully`);
    } catch (error) {
      setDepositError(error as Error);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async () => {
    resetMessages();
    setIsLoading(true);
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: withdrawAmount }),
    };
    try {
      const accountData = await api<AccountData>(
        `transactions/${account.accountNumber}/withdraw`,
        requestOptions
      );
      setAccount({
        accountNumber: accountData.account_number,
        name: accountData.name,
        amount: accountData.amount,
        type: accountData.type,
        creditLimit: accountData.credit_limit,
      });
      setWithdrawSuccessMessage(`Withdrew $${withdrawAmount} successfully`);
    } catch (error) {
      setWithdrawalError(error as Error);
      console.error(error);
    } finally {
      setIsLoading(false);
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
      <div style={{ margin: "auto", width: "20%" }}></div>
      <h2>Balance: ${account.amount}</h2>
      <Grid container spacing={2} padding={2}>
        <Grid item xs={6}>
          <Card className="deposit-card">
            <CardContent>
              {depositError && (
                <Alert severity="error">{depositError.message}</Alert>
              )}
              {depositSuccessMessage && (
                <Alert severity="success">{depositSuccessMessage}</Alert>
              )}
              <h3>Deposit</h3>
              <TextField
                label="Deposit Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: "flex",
                  margin: "auto",
                }}
                onChange={(e) =>
                  setDepositAmount(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                value={depositAmount ?? ""}
                disabled={isLoading}
                inputProps={{ min: 1, step: 1 }}
              />
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  margin: "auto",
                  marginTop: 2,
                }}
                onClick={depositFunds}
                disabled={!depositAmount || depositAmount <= 0}
              >
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Submit"
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className="withdraw-card">
            <CardContent>
              {withdrawalError && (
                <Alert severity="error">{withdrawalError.message}</Alert>
              )}
              {withdrawSuccessMessage && (
                <Alert severity="success">{withdrawSuccessMessage}</Alert>
              )}
              <h3>Withdraw</h3>
              <p>Daily Withdrawal Total: ${withdrawalTotal ?? 0}</p>
              <div
                style={{
                  gap: 20,
                  display: "flex",
                  margin: "auto",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {[20, 50, 100, 150, 200].map((amount) => (
                  <Button
                    key={amount}
                    variant="contained"
                    onClick={() => setWithdrawAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <TextField
                label="Withdraw Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: "flex",
                  margin: "auto",
                }}
                value={withdrawAmount ?? ""}
                onChange={(e) =>
                  setWithdrawAmount(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                inputProps={{ min: 5, step: 5 }}
                disabled={isLoading}
              />
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  margin: "auto",
                  marginTop: 2,
                }}
                onClick={withdrawFunds}
                disabled={!withdrawAmount || withdrawAmount <= 0}
              >
                {isLoading ? <CircularProgress size={20} /> : "Submit"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};
