import { Hono } from 'hono'
import { shorten } from './routes/shorten';
import { redirect } from './routes/redirect';

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', async (c) => {
  const allKeys = await c.env.JUSTALINK.list();
  return c.json(allKeys)
})

app.post('/shorten', shorten)
app.get('/:code', redirect)

export default app
