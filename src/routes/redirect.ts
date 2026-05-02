import type { Context } from 'hono'

export async function redirect(c: Context) {
  const code = await c.req.param('code')
  const value = await c.env.JUSTALINK.get(code);

  if (value) {
    return c.redirect(value)
  }
}
