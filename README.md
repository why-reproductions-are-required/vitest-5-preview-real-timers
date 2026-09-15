# Vitest 5 Preview locator click with real timers

Reproduce a locator click failure with `vitest@5.0.0` and
`@vitest/browser-preview@5.0.0`, using upstream packages from npm.
This project has no Vite+ dependency or package patches.

## Reproduce

Use Node.js `22.12+` on the `22.x` line, `24.x`, or `26+`.

```sh
git clone https://github.com/why-reproductions-are-required/vitest-5-preview-real-timers.git
cd vitest-5-preview-real-timers
npm ci
npm test
```

Open the URL that Vitest prints if your browser does not open.

For an unattended run, use:

```sh
npx playwright install chromium
npm run reproduce
```

On Linux, use `npx playwright install --with-deps chromium` if you need browser
system libraries. The helper opens the Preview page in an external headless
Chromium browser. Vitest still uses the Preview provider; the helper does not
replace locators, change timer settings, or patch Vitest.

## Expected and actual results

In [`preview.test.js`](./preview.test.js), check that `vi.isFakeTimers()` is
`false`, create a button, and click it through `page.getByRole().click()`.
Expect one click event and a passing test.

With `5.0.0`, observe this failure at the locator click:

```text
Error: A function to advance timers was called but the timers APIs are not mocked. Call `vi.useFakeTimers()` in the test file first.
```

Both commands preserve Vitest's exit code: `1` for the test failure.
I reproduced this on macOS with Node.js `22.18.0`, Vite `8.3.0`, and
Playwright `1.63.0` / Chromium `153.0.8010.12`.

## Related upstream work

In [PR #9891](https://github.com/vitest-dev/vitest/pull/9891), the author added
`advanceTimers: delay => vi.advanceTimersByTimeAsync(delay)` to the Preview
user-event adapter without a `vi.isFakeTimers()` check. The published `5.0.0`
package contains this callback in both setup and cleanup.

[Issue #9882](https://github.com/vitest-dev/vitest/issues/9882) covers Preview
locator behavior with fake timers and requests configurable user-event options.
It provides related context, rather than a report of this real-timer regression.
Enabling fake timers changes the test's behavior; it does not test the expected
real-timer behavior above.
