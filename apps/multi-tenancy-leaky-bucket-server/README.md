## Overview
This project is dedicated to the Woovi Leaky Bucket Challenger.

You can import the api collections for testing in your postman, find by file `./docs/graphql-api.collection,json`

> If not found the file, you can build the schemas with `pnpm docs:generate:collections`

### Guide
- Copy the `.env.example` to `.env` 
- Run seed with `pnpm seed` to create sample users and tenants
- You can run test with `pnpm test` for test the buckets and the application
- You can run the graph api with `pnpm dev`
- To access the playground, use the same url from requests `http://localhost:3333/graphql` and always use the method *GET*
- For use the collection need to configure the `environment` with the variable url to appoint `http://localhost:3333/graphql` and always use the method *POST*
- Keep a Redis instance running in docker to ensure that it has not broken in future versions in which it is added for scale :)

The `bacen-dict` module only acknowledgment the keys below:
> For deeper details about `bacen-dict` module you can access: `./src/modules/bacen-dict/README.md`
```ts
[
	'hallex.costa@hotmail.com',
	'hallex.costa1@hotmail.com',
	'hallex.costa2@hotmail.com',
	'validpixkey@hotmail.com',
	'valid-pix-key'
]
```
Quickly explanation about relation between keys, users and tenants:

1) first key
- *hallex.costa@hotmail.com* belongs user1
- user1 belongs tenant1

2) second key
- *hallex.costa1@hotmail.com* belongs user2
- user2 belongs tenant1

1) third and fourth key
- *validpixkey@hotmail.com* and *valid-pix-key* not belongs any user, consequently it does not have any tenants.

**Rules to PixTransacion**
- Users the same tenant can be transfers between users.
- Users of different tenant are recused.

> Depending on the bussiness rule, it may be permissible for users from different tenants to make payments to users from other tenants or even to users who are not in any tenant but have a valid Pix key.

## Deliverables
- [x] A node js http server
- [x] A multi-tenancy strategy to be the owner of requests. For example, you could have users, and each user will have 10 tokens
- [x] Implement an authentication of users with a Bearer Token
- [x] This token must be sent in the request Authorization
- [x] A mutation that simulates a query of a pix key
- [x] A leaky bucket strategy completed

### Leaky Bucket Strategy
- [x] The query starts with 10 query tokens.
- [x] Each request must consume 1 token. If success it keeps your token, if failed it must decrease 1 token from tokens.
- [x] Every hour 1 token is added to the total number of tokens available for request
- [x] 10 is the max limit of tokens
- [x] Simulate requests validating token strategy with Jest to show that the leaky bucket works
- [x] Generate a postman of the API to be consumed

### Bonus
- [x] It uses GraphQL in the Node Server
- [x] A frontend that simulates the initiation of a Pix transaction
- [x] It will fill two fields: pix key and value
- [x] It must request the backend GraphQL
- [x] It must use React and Relay at the frontend

> To access the front-end from this project you view the folder `./apps/multi-tenancy-leaky-bucket-ui`

### References: 
[Woovi Leaky Bucket Challenge](https://github.com/woovibr/jobs/blob/main/challenges/woovi-leaky-bucket-challenge.md)  
[Dict API](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT.html#section/Seguranca/Assinatura-digital)  
[Woovi Bank Server](../bank-server/README.md)  
[Sibelius Seraphini](https://github.com/sibelius)  
[Pix Out - EndToEndId](https://developers.bitcapital.com.br/docs/pix-out#modelo-de-requisi%C3%A7%C3%A3o)  
