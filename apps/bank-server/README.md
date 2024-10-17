## Overview

Woovi Bank Server. Practices inspired in [Tao of Node](https://alexkondov.com/tao-of-node/) philosofy with a functional programming.

To access the production version you can click in below links:  
[Bank Server](https://woovi-bank-server.hallexcosta.com/graphql)  
[Bank UI](https://woovi-bank-ui.hallexcosta.com)  

Default accounts for Login (Passwordless):
- hallex.costa@hotmail.com
- hallex.costa1@hotmail.com

#### Techs
- [x] [Node.js](https://nodejs.org/en)
- [x] [Typescript](https://www.typescriptlang.org)
- [x] [Railway](https://railway.app)
- [x] [MongoDB](https://www.mongodb.com)

#### Frameworks and Libs
- [x] [Koa.js](https://koajs.com/)
- [x] [GraphQL](https://graphql.org/)
- [x] [Mongoose](https://mongoosejs.com/)

### Features
- SignUp
- SignIn
- CreateTransaction
- ListTransactions
- ListUsers
- ListAccounts

### Deliveries
**Backend**
- [x] Send a transaction
- [x] Receive a transaction
- [x] Calculate the available balance of an account
- [x] Use Node and Connection from Relay to handle get collection and lists.

**Backend Plus**
- [x] Expose a GraphQL Playground
- [x] Generate a postman JSON to be able to import and make calls to the Backend GraphQL API
- [x] It uses graphql-HTTP
- [x] It has a test with Jest or a Test Runner of choice

You can generate the api collections from graphql api using command `pnpm docs:generate:collections` and import the `./docs/graphql-api-collection.json` in your postman

### Getting Started

1) Up the containers mongodb and redis
```sh
docker compose up -d
```

2) You can use `pnpm test` to run tests  

3) You can use `pnpm dev` to start server
 
4) For access bank-server
```sh
https://localhost:3333/graphql
```

### References:
[Crud Bank GraphQL Relay](https://github.com/woovibr/jobs/blob/main/challenges/crud-bank-graphql-relay.md)  
[Relay Docs](https://relay.dev/docs)  
[Relay Workshop](https://github.com/sibelius/relay-workshop)