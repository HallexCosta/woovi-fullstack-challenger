import { z } from 'zod'

const envSchema = z.object({
  VITE_GRAPHQL_URL: z.string()
})

console.log(import.meta.env)

export const config = envSchema.parse(import.meta.env)
