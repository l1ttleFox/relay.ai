// English overlay for the server-provided (Russian) instructions catalog.
// Steps are templated, so translation is an exact map plus regex fallbacks.
// Code snippets stay untouched except for user-visible demo strings.

const stepMap = {
  'Выберите команду для своей ОС. Ваш ключ уже подставлен.': 'Pick the command for your OS. Your key is already inserted.',
  'Добавьте API-ключ, чтобы получить готовую команду.': 'Add your API key to get a ready-to-run command.',
  'Выполните команду для своей ОС. Ваш ключ уже подставлен.': 'Run the command for your OS. Your key is already inserted.',
  'Добавьте API-ключ для настройки окружения.': 'Add your API key to configure the environment.',
  'Выполните команду настройки окружения с вашим ключом.': 'Run the environment setup command with your key.',
  'Выполните команду в PowerShell (Windows) или bash (macOS/Linux).': 'Run the command in PowerShell (Windows) or bash (macOS/Linux).',
  'Остановите запущенный Harness (Ctrl+C).': 'Stop the running Harness (Ctrl+C).',
  'Запустите npx @deepseek-ai/dsh web и откройте новую сессию.': 'Run npx @deepseek-ai/dsh web and open a new session.',
  'Установите Node.js с npm.': 'Install Node.js with npm.',
  'Выполните npm install -g @cheapcode/cli@latest.': 'Run npm install -g @cheapcode/cli@latest.',
  'Для входа купленным ключом выполните cheapcode auth login --key.': 'To sign in with your key, run cheapcode auth login --key.',
  'Запустите cheapcode.': 'Run cheapcode.',
  'Установите SDK: python -m pip install openai.': 'Install the SDK: python -m pip install openai.',
  'Установите SDK: npm install openai.': 'Install the SDK: npm install openai.',
  'Задайте переменные из environment, выберите MODEL_ID из каталога.': 'Set the environment variables and pick a MODEL_ID from the catalog.',
  'Сохраните example.py и выполните python example.py.': 'Save example.py and run python example.py.',
  'Сохраните example.mjs и выполните node example.mjs.': 'Save example.mjs and run node example.mjs.',
  'Получите каталог моделей без генерации ответа.': 'Fetch the model catalog without generating a response.',
  'Установите клиент и откройте настройки провайдера.': 'Install the client and open its provider settings.',
  'Установите клиент и откройте настройки подключения.': 'Install the client and open its connection settings.',
  'Для входа вашим ключом выполните cheapcode auth login --key.': 'To sign in with your key, run cheapcode auth login --key.',
  'Выберите OpenAI Compatible.': 'Choose OpenAI Compatible.',
  'Base URL: https://ru.cheapvibecode.ru/v1. API Key: купленный ключ.': 'Base URL: https://ru.cheapvibecode.ru/v1. API Key: your key.',
  'Выберите точный MODEL_ID из каталога /v1/models.': 'Pick the exact MODEL_ID from the /v1/models catalog.',
};

const noticeMap = {
  'Требуется подписка Cursor.': 'A Cursor subscription is required per the provider instructions.',
  'Провайдер импортируется из реестра и сохраняет технический ID cheapvibecode.': 'The provider is imported from the registry and keeps the technical id cheapvibecode.',
};

/** Translates one already-personalized Russian step into English. */
export function translateStep(step) {
  if (stepMap[step]) return stepMap[step];
  let m = /^Установите (.+)\.$/.exec(step);
  if (m) return `Install ${m[1]}.`;
  m = /^Полностью закройте (.+)\.$/.exec(step);
  if (m) return `Completely close ${m[1]}.`;
  m = /^Перезапустите (.+)\.$/.exec(step);
  if (m) return `Restart ${m[1]}.`;
  return step;
}

export function translateNotice(notice) {
  return noticeMap[notice] ?? notice;
}

/** Localizes user-visible demo strings inside code snippets. */
export function translateCode(code, lang) {
  if (lang !== 'en') return code;
  return code.replaceAll('"Привет!"', '"Hello!"').replaceAll("'Привет!'", "'Hello!'");
}
