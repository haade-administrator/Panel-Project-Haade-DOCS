import { promises as fs } from 'fs'
import path from 'path'

const root = process.cwd()
const publicDir = path.join(root, 'public')
const outFile = path.join(publicDir, 'asset_manifest.json')

const EXCLUDE = new Set([
  'asset_manifest.json'
])

async function walk(absDir) {
  const entries = await fs.readdir(absDir, { withFileTypes: true })
  const collected = []
  for (const e of entries) {
    const abs = path.join(absDir, e.name)
    const rel = path.relative(publicDir, abs).replace(/\\/g, '/')

    if (EXCLUDE.has(rel)) continue

    if (e.isDirectory()) {
      collected.push(...await walk(abs))
    } else {
      collected.push(rel)
    }
  }
  return collected
}

async function main() {
  try {
    await fs.access(publicDir)
  } catch {
    console.error('[genAssetManifest] Папка public/ не найдена:', publicDir)
    process.exit(1)
  }

  const files = await walk(publicDir)
  files.sort()
  await fs.writeFile(outFile, JSON.stringify(files, null, 2), 'utf-8')
  console.log(`[genAssetManifest] Создано ${outFile}: ${files.length} путей`)
}

main().catch(e => {
  console.error('[genAssetManifest] Ошибка:', e)
  process.exit(1)
})

