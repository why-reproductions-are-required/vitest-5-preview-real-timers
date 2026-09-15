import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';

test('Preview locator click works with real timers', async () => {
  expect(vi.isFakeTimers()).toBe(false);

  document.body.innerHTML = '<button>Click</button>';
  const onClick = vi.fn();
  document.querySelector('button').addEventListener('click', onClick);

  await page.getByRole('button', { name: 'Click' }).click();

  expect(onClick).toHaveBeenCalledOnce();
});
