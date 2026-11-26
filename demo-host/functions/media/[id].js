/* Archivos subidos desde el portal (fotos, vídeos y portadas de vídeo), guardados en KV. */
import { kvOf } from '../_lib/core.js';

export async function onRequestGet({ params, env, request }) {
  const kv = kvOf(env);
  const id = String(params.id || '');
  if (!kv || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) return new Response('No encontrado', { status: 404 });
  const { value, metadata } = await kv.getWithMetadata('media:' + id, { type: 'arrayBuffer', cacheTtl: 86400 });
  if (!value) return new Response('No encontrado', { status: 404 });
  const type = (metadata && metadata.type) || 'application/octet-stream';
  const size = value.byteLength;
  const base = {
    'content-type': type,
    'cache-control': 'public, max-age=31536000, immutable',
    'accept-ranges': 'bytes',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex, nofollow',
  };
  // Los vídeos en Safari/iPhone necesitan respuestas por rangos.
  const range = request.headers.get('range');
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  if (m) {
    let start = m[1] === '' ? size - Number(m[2]) : Number(m[1]);
    let end = m[1] !== '' && m[2] !== '' ? Number(m[2]) : size - 1;
    if (start < 0) start = 0;
    if (end >= size) end = size - 1;
    if (start > end) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } });
    return new Response(value.slice(start, end + 1), { status: 206, headers: { ...base, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': String(end - start + 1) } });
  }
  return new Response(value, { headers: { ...base, 'content-length': String(size) } });
}
