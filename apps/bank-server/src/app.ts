import 'module-alias/register'
import Koa from 'koa'

export const app = new Koa()

app.on('error', (err) => {
  // eslint-disable-next-line
  console.log('app error: ', err)
})
