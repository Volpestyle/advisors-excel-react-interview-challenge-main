import React, { useState } from "react";
import { Paper, Grid, TextField, Button, Alert } from "@mui/material";

type SignInProps = {
  accountNumberError: Error | undefined;
  setAccountNumberError: (error: Error | undefined) => void;
  signIn: (accountNumber: number) => Promise<void>;
};

export const SignIn = (props: SignInProps) => {
  const { signIn, accountNumberError, setAccountNumberError } = props;
  const [accountNumber, setAccountNumber] = useState("");

  return (
    <Paper sx={{ border: 20, borderBottom: 30, borderColor: "white" }}>
      {accountNumberError && (
        <Alert severity="error">{accountNumberError.message}</Alert>
      )}
      <h1 className="app-title">Please Sign in with your Account Number:</h1>
      <Grid container>
        <Grid item xs={2} />
        <Grid item xs={8}>
          <TextField
            type="number"
            variant="outlined"
            label="Account Number"
            sx={{ display: "flex", margin: "auto" }}
            onChange={(e) => {
              setAccountNumberError(undefined);
              setAccountNumber(e.target.value);
            }}
            value={accountNumber}
            error={!!accountNumberError}
          />
        </Grid>
        <Grid item xs={2} />
      </Grid>
      <Button
        variant="contained"
        color="primary"
        sx={{
          display: "block",
          margin: "auto",
          marginTop: 2,
        }}
        onClick={async () => await signIn(+accountNumber)}
      >
        Sign In
      </Button>
    </Paper>
  );
};
