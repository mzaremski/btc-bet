Live website: https://main.d2x6l2oidilxch.amplifyapp.com/

## How to Deploy

- Create GitHub repo and push the app into the repo.
- Create AWS Amplify app.
- Connect the repo to the Amplify app.
- Set permission: App -> App Settings -> General Settings -> Edit -> Edit service role -> (Create a new role with AdministratorAccess-Amplify or AmplifyBackendDeployFullAccess) -> Assign the role into the Amplify app.
- Push commit/Run Build.

## How to Review

- Every comment in the code in the backend matters. There are some info what I would like to change or improve.

## Stack

- FrontEnd: React, Vite
- Backend: Lambda
- Database: DynamoDB

## Comment

- I decided the app is just a "fun game". No "trading system".
- To not make the solution unnecessarily complex by using EventBridge scheduler or SQS delay. As well as I didn't want to make it too naive by using runtime timers, I decided to create Lambdas which also make the solution cheap. The solution on Lambdas is also simple to maintain and deploy as it just needs AWS services (Amplify with backend).
- The front end is "vibecoded" 

## How the App Works from the User Perspective

- User opens the website. User gets UUID generated and saved into localStorage.
- User clicks UP or DOWN button that makes their guess and runs request.
- Request `POST /users/{userId}/guesses` saves guess `userId` + `timestamp` in DynamoDB.
- If there is any record with `userId` and no `checkTimestamp` already, don't let the user make any other guess and return.
- User client waits 60s, sends `GET /users/{userId}/guesses/latest` and sees the answer.
- The user sees their total score in the website.
- When the client opens browser, the browser sends `GET /users/{userId}/guesses/latest` request right away. There might be 3 cases:
  - The user entered the game first time, so there is no userId. GET request is not sent.
  - There is userId in localStorage already, so `GET /users/{userId}/guesses/latest` is sent. There might be 2 cases:
    - The user was on the website and made the guess. Re-opened the website until 60s passed. The response from the request still doesn't contain `checkTimestamp`. The app should calculate how much time passed since `timestamp`, calculate how much time left (based on `timestamp` and `checkDelaySeconds` to make 60s passed) and run the request again.
    - The user was on the website and made the guess. Re-opened the website after 60s from the guess passed. The request should have `checkTimestamp` in the response and the app should display the `totalScore`.

## DynamoDB Schema

- Partition key: `userId`
- Sort key: `timestamp`
- Fields:
  - `userId` (string, required)
  - `timestamp` (string, required)
  - `isVoteUp` (boolean, required)
  - `checkDelaySeconds` (integer, required)
  - `checkTimestamp` (string, optional)
  - `scoreChange` (integer, optional)
  - `totalScore` (integer, optional)
  - `createdAt` (string, required)
  - `updatedAt` (string, required)

## API

### POST /users/{userId}/guesses

- Checks if there is no other guesses in progress.
- Saves to DynamoDB:
  - `userId`
  - `timestamp`
  - `isVoteUp`
  - `checkDelaySeconds`

### GET /users/{userId}/guesses/latest (idempotent)

- Do:
  - When user runs it, when the `checkDelaySeconds` passed, the function:
    - Reads BTC price from guess and check timestamps.
    - Compares if the user guessed right.
    - Saves `scoreChange`, updates `totalScore`.
- Returns:
  - `timestamp`
  - `checkTimestamp`
  - `checkDelaySeconds`
  - `scoreChange`
  - `totalScore`
  - `isGuessInProgress`

## Problems

- When running handler(createBaseEvent()) in tests, middy conflicts with types, but handles the event correctly in the middleware.
- I used React Vite for the first time, and spent some time to configure eslint.
- Could not get amplify_outputs.json from the AWS Amplify to get the prod connection (but used sandbox for development purposes).
- There was no specification what happens when the price stays the same.

## What I Would Like to Improve

- No tests for get-latest-guess.
- The API responses should be types. Might be based on zod, so it's easy to generate documentation for it.
- I would like to use utils/errors.ts more. It supposed to throw and later in middleware should be catcher that examines the error (what kind of, what to do with it) and return the right HTTP code and error name (we should not expose internal errors to user). It should also push error logs into internal observability tools.
- Deduct zod types based on the db schema.
- I use Middy covers only x-form-encoded.
- Logger.
- CORS. Restrict just one domain.
- Use absolute paths in the projects.
- Use https://www.conventionalcommits.org/en/v1.0.0/ for commits.
