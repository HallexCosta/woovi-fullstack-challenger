## Overview 
This project is dedicated to the Woovi Leaky Bucket Challenger

### Guide
- Copy the `.env.example` to `.env` 
- In leaky bucket server run `pnpm seed` to create sample users and tenants
- You can run the UI with `pnpm dev`
- To view use you can access the address`http://localhost:5173`

The UI is integrated with backend then, you can make operation of `PixKeyQuery` and `CreatePixTransaction` through the UI respecting the Bucket rules.

- Each request for `PixKeyQuery` success or fails consume 1 token.
- If the PixKeyQuery success request was converted in a `PixTransaction`, the bucket is filled with 1 token. 
- You cannot consult the same Pix key as belongs current user in our case, the default pix key is `hallex.costa@hotmail.com`
- You cannot consult the Pix key you have already consulted before. This was implemented as a way to save tokens to avoid unnecessary requests
- Case the pix key already consulted it storage in memory and you can convert in a pix transaction.

> For deeper details of leaky bucket rules and know which pix keys are accepted by the bacen-dict module (simulator)
> you can access the `./apps/multi-tenancy-leaky-bucket-server/README.md`