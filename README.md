# Relay AI — MVP кабинета покупателей

Кабинет показывает доступный остаток токенов по купленному ключу и инструкции
подключения. Служебные запросы и инструкции проходят через этот backend, а AI-запросы
остаются **напрямую** у upstream-провайдера.

## Запуск

Node.js 22.12+:

```sh
npm install
npm run server
# В другом терминале, для существующего интерфейса:
npm run dev
```

API-ключ покупателя передаётся в интерфейс и не сохраняется сервером.

`.env`:

```env
PORT=3000
CVC_ORIGIN=https://ru.cheapvibecode.ru
PUBLIC_ORIGIN=https://relay-ai-ami6.onrender.com
```

API-ключи и cookies владельца в `.env` не нужны. Старые `PUBLIC_BASE_URL`,
`HISTORY_DB_PATH`, `PROXY_TIMEOUT_MS` больше не используются. SQLite не открывается;
ранее созданные файлы БД автоматически не удаляются.

Backend слушает `127.0.0.1:3000`. Vite проксирует `/api` в backend.
В production раздавайте frontend и направляйте `/api/*` через HTTPS reverse proxy
в backend. Публичный адрес проекта используется только для кабинета.

## API

Все ответы имеют `Cache-Control: no-store`.

### `GET /api/account`

```http
Authorization: Bearer <ключ покупателя>
```

Запрашивает `https://ru.cheapvibecode.ru/v1/balance` и возвращает:

```json
{"remainingTokens":10000,"updatedAt":"2026-09-12T00:00:00.000Z"}
```

Для ключа с lifetime-лимитом, согласно Docs провайдера, это минимум из остатка
аккаунта и остатка лимита ключа. Не денежный баланс. Backend не пересчитывает его
по расходам и не кэширует между запросами. UI обновляет его примерно раз в минуту
и вручную. Ключ передаётся только в памяти, не сохраняется сервером.

### `GET /api/models`

Тот же Bearer-ключ. Возвращает исходный каталог `/v1/models` для выбора MODEL_ID.

### `GET /api/instructions`

Публичный ответ: `source`, `version`, `autoSynced`, `baseUrl`, `directBaseUrl`,
`connectionMode`, `endpoints`, `environment`, `guides`.

Локальный снимок команд установки из документации upstream, проверенный 12.09.2026.
Предоставлены Codex App/CLI/VS Code, Claude Code/App, OpenCode, Cursor, Gemini CLI,
Kimi Code, DeepSeek Harness, Pi, Hermes, Grok Build, Cheap Code.
Команды содержат placeholder `YOUR_API_KEY`, используют прокси-маршруты этого
backend и поддерживают варианты Windows/macOS/Linux, где они присутствуют у upstream.
Скрипты на нашем backend не исполняются. Автоматического обновления снимка нет.

Python, JavaScript, curl и общие инструкции совместимых клиентов дополнены локально
и имеют `source: local-example`; перенесённые инструкции — `source: provider-docs`.
Статус `documented` означает наличие команды в Docs, а не тест установки каждого
клиента. Это снимок основных команд, не полная копия всех вкладок ручной настройки.

Для служебных запросов инструкции используют `/api/account` и `/api/models` этого
backend. AI-клиентам по-прежнему указывается `https://ru.cheapvibecode.ru/v1`;
Codex и другие специальные клиенты получают настройки через локально проксированные
установщики.

## Границы MVP

История и фоновая синхронизация dashboard отложены. `/api/history` и все `/v1/*`
AI-маршруты на нашем backend возвращают 404. Сервер не принимает и не пересылает
генерации; только инструкции и установочные скрипты проксируются с сохранением их
исходного содержимого.
Гипотеза сопоставления истории по расходам записана в `IMPLEMENTATION_PLAN.md`.

## Проверки

`npm test` — HTTP integration и unit tests с mock upstream, без настоящих ключей.
`npm run build` — сборка интерфейса.
