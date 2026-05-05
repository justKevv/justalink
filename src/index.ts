import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { shorten } from './routes/shorten';
import { redirect } from './routes/redirect';

const app = new Hono<{ Bindings: CloudflareBindings }>()

// app.get('/', async (c) => {
//   const allKeys = await c.env.JUSTALINK.list();
//   return c.json(allKeys)
// })

app.post('/shorten', shorten)
app.get('/:code', redirect)
app.get('*', serveStatic({ root: './' }))

export default app
