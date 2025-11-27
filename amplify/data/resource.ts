import { a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Guess: a
    .model({
      userId: a.string().required(),
      timestamp: a.string().required(),
      isVoteUp: a.boolean().required(),
      checkDelaySeconds: a.integer().required(),
      checkTimestamp: a.string(),
      scoreChange: a.integer(),
      totalScore: a.integer(),
    })
    .identifier(["userId", "timestamp"])
    .authorization((allow) => [allow.publicApiKey().to(["read", "create", "update"])]),
});

export const data = defineData({
  schema,
  authorizationModes: {
    // TODO: Remove the apiKey access. Let only the lambda to use the DynamoDB
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
