import { preview } from '@vitest/browser-preview';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: preview(),
      headless: false,
      // CI defaults this to false, which makes Preview request an unsupported viewport command.
      ui: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
