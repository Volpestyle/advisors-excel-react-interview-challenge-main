## Questions

### What issues, if any, did you find with the existing code?

- api package did not start locally with correct env variables

#### Sign in

- We weren't passing error from api to ui for failed 'sign in'
- 'Account Number' input was completely clearing after 'sign in' press

#### Account Dashboard

- No validation for negatives or 0 in the deposit/withdrawal inputs
- No UI feedback for loading, success, or error

#### API Validation and error handling

- Errors from API were not normalized. Sometimes returns as 400 with the error string as the actual response body or in response.error
- Need to protect against withdrawing negative values

#### Types

- No typing for the fetch responses
- Type name wasn't capitalized

#### Nit

- No quickstart documentation

### What issues, if any, did you find with the request to add functionality?

- Needed clarity: Is the 'day' tracking a rolling 24 hour window? or is it the calendar day? I did the former.
- Needed to add new DB table to track transactions, and introduce db locking mechanism when doing balance updates in order to safely make balance updates and track daily withdrawals.

### Would you modify the structure of this project if you were to start it over? If so, how?

- Structure is fine, maybe use pnpm for monorepo

### Were there any pieces of this project that you were not able to complete that you'd like to mention?

### If you were to continue building this out, what would you like to add next?

- Add RTL fixure tests and Playwright e2e testing
- User password authentication
- Transaction history view

### If you have any other comments or info you'd like the reviewers to know, please add them below.

- Used Google Search for:

  - 'how to pass env file into nodemon ts'
  - [1 day interval in postgres](https://www.postgresql.org/docs/current/functions-datetime.html)
  - [DB locking in postgres](https://node-postgres.com/features/transactions)
  - [improving fetch typing](https://stackoverflow.com/questions/41103360/how-to-use-fetch-in-typescript)

- Asked AI to generate the first iteration of quickstart.md guide (NO CODE!!!!)
