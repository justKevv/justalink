import type { Context } from 'hono'
import { generateCode } from '../lib/utils';

export async function shorten(c: Context) {
  const formData = await c.req.formData();
  const url = formData.get('url');
  const code = generateCode();

  const kv = await c.env.JUSTALINK.put(code, url);

  return c.json({ url, code })
}
