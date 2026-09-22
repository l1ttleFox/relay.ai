import { createApp } from './app.mjs';
import { createInstructionProxy, createProvider } from './provider.mjs';

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const request = createProvider();
request.instruction = createInstructionProxy();
const server = createApp({ request });
server.listen(port, host, () => console.log(`Relay API: http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  server.close(() => process.exit(0));
});
