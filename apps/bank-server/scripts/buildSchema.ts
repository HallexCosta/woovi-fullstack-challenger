import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { printSchema } from 'graphql/utilities'

import { schema } from '../src/schema'

export async function run() {
  await fs.writeFile(
    path.join(__dirname, '../schema/schema.graphql'),
    printSchema(schema)
  )

  if (process.env.CLI) process.exit(0)
}
run()
