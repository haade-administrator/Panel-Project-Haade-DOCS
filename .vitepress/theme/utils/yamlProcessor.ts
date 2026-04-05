import JSZip from 'jszip'

export interface BuildArchiveOptions {
  basePath?: string               // Базовый путь на сервере/хостинге для fetch
  mainFile: string                // Путь к main.yaml (относительно basePath)
  assetFiles: string[]            // Файлы ассетов, попадут в assets/
  widgetFiles: string[]           // Файлы виджетов, попадут в widgets/
  zipName?: string                // Имя архива (по умолчанию 'project.zip')
  skipMissing?: boolean           // Пропускать ли отсутствующие файлы без .error.txt
  climateWidgetFile?: string      // Имя файла (как в widgetFiles), к которому применяем подстановку
  climateEntity?: string          // Значение сущности, выбранной в UI (например sensor.room_temp)
  climateEntityKey?: string       // Ключ в substitutions (по умолчанию 'climate_entity')
  substitutionInsertionMode?: 'top' | 'bottom' // Если нет блока substitutions: куда вставлять. По умолчанию 'top'
  fetchFn?: (url: string) => Promise<Response> // Можно подменить (для тестов)
  binaryExt?: string[]            // Расширения бинарных файлов
}

const DEFAULT_BINARY_EXT = [
  '.png','.jpg','.jpeg','.gif','.bmp','.ico',
  '.ttf','.otf','.woff','.woff2','.bin'
]

/**
 * Проверяем расширение — бинарный ли файл (упрощённо).
 */
function isBinary(path: string, list: string[]) {
  const lower = path.toLowerCase()
  return list.some(ext => lower.endsWith(ext))
}

/**
 * Загружает файл (text или arrayBuffer) в зависимости от расширения.
 */
async function loadFile(
  basePath: string | undefined,
  relPath: string,
  binaryExt: string[],
  fetchFn: (url: string) => Promise<Response>
): Promise<{ ok: boolean; text?: string; data?: ArrayBuffer; error?: string; binary: boolean }> {
  let url = relPath
  if (basePath && !/^https?:\/\//i.test(relPath)) {
    if (basePath.endsWith('/')) url = basePath + relPath
    else url = basePath + '/' + relPath
  }
  try {
    const isBin = isBinary(relPath, binaryExt)
    const resp = await fetchFn(url)
    if (!resp.ok) {
      return { ok: false, error: `HTTP ${resp.status}`, binary: isBin }
    }
    if (isBin) {
      const buf = await resp.arrayBuffer()
      return { ok: true, data: buf, binary: true }
    } else {
      const txt = await resp.text()
      return { ok: true, text: txt, binary: false }
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message, binary: false }
  }
}

/**
 * Вставляет или обновляет подстановку в секции substitutions.
 * Алгоритм:
 * 1. Ищем строку вида "^(\s*)substitutions:\s*$".
 * 2. Если блок найден — ищем внутри (пока отступ > indent блока) строку с ключом.
 * 3. Если ключ найден — заменяем значение.
 * 4. Если не найден — вставляем новую строку после последней строки блока.
 * 5. Если блок не найден — добавляем блок либо в начало (top), либо в конец (bottom).
 */
export function injectSubstitutionIntoYaml(
  content: string,
  key: string,
  value: string,
  insertionMode: 'top' | 'bottom' = 'top'
): string {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blockRegex = /^(\s*)substitutions:\s*$/
  let blockStart = -1
  let blockIndent = 0

  for (let i = 0; i < lines.length; i++) {
    const m = blockRegex.exec(lines[i])
    if (m) {
      blockStart = i
      blockIndent = m[1].length
      break
    }
  }

  const kvPattern = new RegExp(`^(\\s*)${key}:\\s*(.*)$`)
  const newKVLine = ' '.repeat(blockIndent + 2) + `${key}: ${value}`

  if (blockStart >= 0) {
    // Найдём конец блока
    let insertPos = blockStart + 1
    let existingKeyLine = -1
    for (let i = blockStart + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim() === '') {
        insertPos = i + 1
        continue
      }
      const nonEmpty = /^(\s*)\S/.exec(line)
      if (!nonEmpty) continue
      const curIndent = nonEmpty[1].length
      if (curIndent <= blockIndent) {
        // блок закончился
        insertPos = i
        break
      }
      // внутри блока
      const km = kvPattern.exec(line)
      if (km && km[1].length === blockIndent + 2) {
        existingKeyLine = i
      }
      insertPos = i + 1
    }
    if (existingKeyLine >= 0) {
      lines[existingKeyLine] = newKVLine
    } else {
      // Вставляем новую строку в позицию insertPos
      lines.splice(insertPos, 0, newKVLine)
    }
    return lines.join('\n')
  } else {
    // Блока нет
    const blockLines = [
      'substitutions:',
      '  ' + `${key}: ${value}`,
      ''
    ]
    if (insertionMode === 'top') {
      return blockLines.join('\n') + lines.join('\n')
    } else {
      const trimmed = content.replace(/\s+$/,'')
      return trimmed + '\n\n' + blockLines.join('\n')
    }
  }
}

/**
 * Собирает ZIP.
 */
export async function buildProjectZip(opts: BuildArchiveOptions): Promise<Blob> {
  const {
    basePath,
    mainFile,
    assetFiles,
    widgetFiles,
    zipName = 'project.zip',
    skipMissing = false,
    climateWidgetFile,
    climateEntity,
    climateEntityKey = 'climate_entity',
    substitutionInsertionMode = 'top',
    fetchFn = (url: string) => fetch(url, { cache: 'no-cache' }),
    binaryExt = DEFAULT_BINARY_EXT
  } = opts

  const zip = new JSZip()

  // MAIN
  const mainRes = await loadFile(basePath, mainFile, binaryExt, fetchFn)
  if (mainRes.ok && !mainRes.binary && mainRes.text != null) {
    zip.file('main.yaml', mainRes.text)
  } else if (!mainRes.ok) {
    if (!skipMissing) {
      zip.file('main.yaml.error.txt', `# Не удалось загрузить ${mainFile}: ${mainRes.error}\n`)
    }
  } else {
    // Если вдруг main бинарный — маловероятно, но положим как есть
    if (mainRes.data) zip.file('main.yaml', mainRes.data)
  }

  async function processFile(relPath: string, targetDir: 'assets' | 'widgets') {
    const res = await loadFile(basePath, relPath, binaryExt, fetchFn)
    const targetPath = `${targetDir}/${relPath}`.replace(/\/+/g,'/')
    if (!res.ok) {
      if (!skipMissing) {
        zip.file(targetPath + '.error.txt', `# Не удалось загрузить ${relPath}: ${res.error}\n`)
      }
      return
    }
    if (res.binary && res.data) {
      zip.file(targetPath, res.data)
    } else if (res.text != null) {
      let text = res.text
      // Если это файл климат-виджета и передано значение сущности — модифицируем
      if (climateEntity && climateWidgetFile && relPath === climateWidgetFile) {
        text = injectSubstitutionIntoYaml(text, climateEntityKey, climateEntity, substitutionInsertionMode)
      }
      zip.file(targetPath, text)
    }
  }

  for (const a of assetFiles) {
    await processFile(a, 'assets')
  }
  for (const w of widgetFiles) {
    await processFile(w, 'widgets')
  }

  return await zip.generateAsync({ type: 'blob' })
}

/**
 * Скачивает ZIP (браузер).
 */
export async function downloadProjectZip(opts: BuildArchiveOptions) {
  const blob = await buildProjectZip(opts)
  const name = opts.zipName || 'project.zip'
  // динамический импорт file-saver (чтобы не тянуть в SSR)
  const mod = await import('file-saver')
  mod.saveAs(blob, name)
}



