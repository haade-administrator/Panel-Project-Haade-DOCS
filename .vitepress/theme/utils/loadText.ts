export async function loadText(relPath: string, noCache = true): Promise<string> {
  const base = import.meta.env.BASE_URL || '/'
  const url = base + relPath.replace(/^\/+/, '')
  const r = await fetch(url, {
    cache: noCache ? 'no-cache' : 'default'
  })
  if (!r.ok) {
    throw new Error(`HTTP ${r.status} ${r.statusText} при загрузке ${url}`)
  }
  return r.text()
}
