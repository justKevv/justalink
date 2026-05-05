import type { Context } from 'hono'

export async function shorten(c: Context) {
  const formData = await c.req.formData();
  const url = formData.get('url');
  const expires30 = formData.has('expires30');
  const code = formData.get('code');

  if (expires30) {
    await c.env.JUSTALINK.put(code, url, {
      expirationTtl: 60 * 60 * 24 * 30
    });
  } else {
    await c.env.JUSTALINK.put(code, url);
  }

  return c.json({ url, code, expires30 })
}
