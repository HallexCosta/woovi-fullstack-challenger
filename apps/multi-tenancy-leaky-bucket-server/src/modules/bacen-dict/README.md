## Ovierview

This module is dedicated to simulate bacen dict keys check and create pix transaction with a Token Bucket Strategy.  
The `bacen-dict` module can be moved to another application or separeted to a service isolated graceful the magic of modular architecture :)  

### Types
- BacenAccount
- BacenTransaction

## Mutations
- BacenPixKeyQuery
Check if Pix Key is valid in Dict

- BacenCreatePixTransaction
Create transaction and refill the token consumed by BacenPixKeyQuery

- BacenRollbackToken (beta)
By default the tokens are consumed, if necessary is maked a rollback to refill the bucket with the one token.
The mutation can be called in anywhere using node-fetch graphql request


> The bucket params config from `bacen-dict` module follow the real params used in Bacen Dict API KEY_CHECK  

## Bucket Strategy

**BacenPixKeyQuery**
| reason           | consume tokens/req | refill tokens/min |
| ---------------- | ------------------ | ----------------- |
| INVALID_PIX_KEY  | 20                 | 0                 |
| VALID_PIX_KEY    | 1                  | 0                 |
| TOO_MANY_REQUEST | 0                  | 0                 |


**BacenCreatePixTransaction**
| status                         | consume tokens/req | refill tokens/min    |
| ------------------------------ | ------------------ | -------------------- |
| SUCCCESS_CREATE_TRANSACTION    | 0                  | 1 - BacenPixKeyQuery |
| TOO_MANY_REQUEST_PIX_KEY_QUERY | 0                  | 0                    |


https://www.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT.html#section/Seguranca/Limitacao-de-requisicoes