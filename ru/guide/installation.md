# Установка и настройка

В этом разделе мы подробно рассмотрим два основных способа установки прошивки **Guition ESP32-S3-4848S040**: через **VSCode с ESPHome** для разработчиков и через **ESPHome Builder** в Home Assistant для обычных пользователей.

## Выбор метода установки

### ESPHome Builder в Home Assistant (для пользователей)
**Рекомендуется если:**
- Нужно быстро получить рабочее устройство
- Не планируете серьезных изменений в коде
- Предпочитаете веб-интерфейс

### VSCode (для разработчиков)
**Рекомендуется если:**
- Вы планируете модифицировать код
- Нужна полная кастомизация интерфейса
- Хотите понимать как работает прошивка
- Есть опыт работы с IDE

---

## Перед установкой

### Настройки Home Assistant:

Для управления устройствами необходимо включить опцию «Разрешить устройству выполнять действия Home Assistant» в интеграции ESPHome с Home Assistant.

А также установить пользовательский [компонент](https://github.com/haade-administrator/homeassistant-display-tools) для перевода и обложек для медиаплеера.

## Метод 1: Установка через ESPHome Builder:

::: note ПРИМЕЧАНИЕ
Возможно, этот метод и является более простым для пользователя, но это не совсем так, так как ESPHome Builder видит только файлы в корне папки esphome, то есть через него Вы сможете править только файл main.yaml. А остальные файлы, чтобы изменить demo сущности на Ваши, придется использовать другой редактор, например File Editor 
:::

1. Скачайте ZIP файл из [репозитория](https://github.com/haade-administrator/Guition-ESP32-S3-4848S040)
2. Перенесите (скопируйте) все файлы из папки `src` репозитория как есть в корень папки `esphome` в Home Assistant (homeassistant/esphome)
3. Откройте файл `secrets.yaml` (через ESPHome Builder, сверху справа). Внесите в него данные:

```yaml
wifi_ssid: "Ваша Wi-Fi сеть"
wifi_password: "Ваш пароль к Wi-Fi сети"

display_key: "Ваш сгенерированный токен для API доступа к home assistant"
display_ota: "Ваш сгенерированный токен для OTA прошивки"

```
4. Во всех файлах в папке `widgets` в `substitutions` все переменные, заканчивающиеся на `entity` надо заменить на свои, например:

```yaml
substitutions:

  weather_entity: "weather.home_assistant"
  temperature_entity: "sensor.outside_temperature"
  humidity_entity: "sensor.outside_humidity"
  co2_entity: "sensor.carbon_dioxide"
```
::: warning ВНИМАНИЕ!
Очень важно заменить все demo сущности на Ваши, иначе прошивка работать не будет! Подробнее можно узнать из раздела Виджеты.
:::

5. Через ESPHome Builder находим `main.yaml` (Display) и нажимаем `install`

## Метод 2: Установка через VSCode:

### Шаг 1: Подготовка среды разработки

#### Установка VSCode
1. Скачайте и установите [Visual Studio Code](https://code.visualstudio.com/)
2. Запустите VSCode

#### Установка расширения ESPHome
1. Откройте панель расширений (`Ctrl+Shift+X`)
2. Найдите и установите **"ESPHome"** от ESPHome
3. Перезапустите VSCode

#### Установка Python и ESPHome CLI
```bash
# Установка Python (если не установлен)
# Windows: скачайте с python.org
# macOS: brew install python3
# Ubuntu/Debian: sudo apt install python3 python3-pip

# Установка ESPHome
pip3 install esphome

# Проверка установки
esphome version
```

### Шаг 2: Клонирование репозитория
```bash
# Клонируйте репозиторий
git clone https://github.com/haade-administrator/Guition-ESP32-S3-4848S040.git

# Перейдите в папку проекта
cd Guition-ESP32-S3-4848S040

# Откройте проект в VSCode
code .
```

### Шаг 3: Настройка конфигурации
Создайте файл `secrets.yaml` в корне проекта:

```yaml
wifi_ssid: "Ваша Wi-Fi сеть"
wifi_password: "Ваш пароль к Wi-Fi сети"

display_key: "Ваш сгенерированный токен для API доступа к home assistant"
display_ota: "Ваш сгенерированный токен для OTA прошивки"

```

Во всех файлах в папке `widgets` в `substitutions` все переменные, заканчивающиеся на `entity` надо заменить на свои, например:

```yaml
substitutions:

  weather_entity: "weather.home_assistant"
  temperature_entity: "sensor.outside_temperature"
  humidity_entity: "sensor.outside_humidity"
  co2_entity: "sensor.carbon_dioxide"
```
::: warning ВНИМАНИЕ!
Очень важно заменить все demo сущности на Ваши, иначе прошивка работать не будет! Подробнее можно узнать из раздела Виджеты.
:::

### Шаг 4: Прошивка по OTA или UART

#### OTA
Перейдите на вкладку с файлом `main.yaml`. Нажмите кнопку `🚀OTA`

#### UART
В меню VSCode выберите `Терминал` далее `Создать терминал`. В терминале вбейте команду
```bash
# где /dev/cu.wchusbserial140 - порт устройства (замените на свой)
esphome run main.yaml --device /dev/cu.wchusbserial140
```

