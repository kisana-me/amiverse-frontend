// Loaded first by the synthesized bundle entry (see overrides/source-kit.mjs).
//
// Components pull in the Next.js client runtime (next/link, next/image), which
// reads `process.env.*` and `process.platform` at module scope and at render
// time. There is no bundler define that covers every `__NEXT_*` key, and an
// undefined `process` throws before anything renders — one ReferenceError takes
// down the whole card AND every design built from this bundle.
//
// A plain object is enough: unknown keys read as undefined, which is exactly
// what the Next runtime treats as "feature off".
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: { NODE_ENV: 'production' },
    platform: 'browser',
    version: '',
    versions: {},
    nextTick: (fn, ...args) => Promise.resolve().then(() => fn(...args)),
    cwd: () => '/',
  }
}
