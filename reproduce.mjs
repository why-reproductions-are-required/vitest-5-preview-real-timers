import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';
import { chromium } from 'playwright';

// Preview expects a person to open its page. Use an external browser for
// unattended reproduction; Vitest still uses the unmodified Preview provider.
const browser = await chromium.launch({ headless: true });
let child;

try {
  const page = await browser.newPage();
  const cli = fileURLToPath(new URL('./vitest.mjs', import.meta.resolve('vitest/package.json')));
  child = spawn(process.execPath, [cli, 'run', ...process.argv.slice(2)], {
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 60_000,
  });

  let output = '';
  let navigation;
  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
    output += chunk.toString();
    const match = stripVTControlCharacters(output).match(/Browser runner started at (https?:\/\/\S+)/);
    if (match && !navigation) {
      navigation = page.goto(match[1]);
      navigation.catch(() => child.kill());
    }
  });
  child.stderr.pipe(process.stderr);

  const [code, signal] = await once(child, 'close');
  await navigation;
  if (signal) {
    throw new Error(`Vitest stopped with ${signal}; the reproduction did not complete.`);
  }
  if (!navigation) {
    throw new Error('Vitest did not open a Preview page.');
  }
  // Preserve the test failure. Exit code 1 is the expected result on 5.0.0.
  process.exitCode = code ?? 1;
} finally {
  if (child && child.exitCode === null && child.signalCode === null) {
    child.kill();
  }
  await browser.close();
}
