// Утилита для использования внутри VitePress.
// Предполагается, что yamlProcessor.ts лежит в src/ (на уровне проекта).
// Путь скорректируйте под ваш реальный.

import { downloadProjectZip, BuildArchiveOptions } from './yamlProcessor'

/**
 * Простая функция-обёртка, которая дергается из компонента кнопки.
 * Здесь можно добавить логику получения значения сущности из UI состояния.
 */
export async function handleDownloadZip(options: {
  climateEntity?: string
}) {
  // Пример: берём климат сущность из параметров (или из глобального стора если подключите Pinia/Vuex).
  const climateEntity = options.climateEntity

  const buildOpts: BuildArchiveOptions = {
    basePath: '/project-files', // пример: папка где размещены yaml на сервере
    mainFile: 'main.yaml',
    assetFiles: [
      'images.yaml',
      'fonts.yaml',
      'colors.yaml'
    ],
    widgetFiles: [
      'climate_widget.yaml',
      'loading_widget.yaml'
    ],
    climateWidgetFile: 'climate_widget.yaml',
    climateEntity,
    climateEntityKey: 'climate_entity',
    substitutionInsertionMode: 'top',
    zipName: 'project.zip',
    skipMissing: false
  }

  await downloadProjectZip(buildOpts)
}
