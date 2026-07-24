// Builds the stylesheet that cfg.cssEntry points at.
//
// The Amiverse DS styling idiom is two layers: Tailwind v4 utilities (compiled
// on demand from the classes used in src/) plus the CSS custom properties
// UIProvider injects (mirrored in .design-sync/tokens.css). Neither exists as a
// shipped stylesheet in this repo, so this script produces the combined file.
//
// Run before package-build.mjs:
//   node .design-sync/build-css.mjs
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const OUT = '.design-sync/.cache/ds-styles.css'
mkdirSync('.design-sync/.cache', { recursive: true })

const from = process.cwd() + '/.design-sync/.cache/tailwind-in.css'
const res = await postcss([tailwind()]).process('@import "tailwindcss" source("../../src");', { from, to: process.cwd() + '/' + OUT })

writeFileSync(OUT, res.css + '\n' + readFileSync('.design-sync/tokens.css', 'utf8'))
console.log(`wrote ${OUT} (${res.css.length} bytes tailwind + tokens)`)
