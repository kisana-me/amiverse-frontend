// Non-storybook `package` adapter. Bundles dist/ when present (the authoritative
// component list comes from shipped .d.ts; with no dist it synthesizes an
// entry from src/ as a last resort) and opportunistically enriches each
// component from src/ — JSDoc and dir-derived group. Every enrichment miss
// degrades to the plain-dist behaviour.
//
// Discovery is heuristic-based; each heuristic has a `.design-sync/config.json`
// override (ASSUMPTION comments below name them) so repos that don't match the
// defaults write config, not code. `componentSrcMap` is the single override
// knob for component inclusion: non-null value = add/pin src path, null =
// exclude a .d.ts-exported internal.

// forked from design-sync lib/source-kit.mjs — exclude the Next.js app router tree from src discovery
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { Project, Node, ts } from 'ts-morph';
import { leadingJsdoc, readText, slash, walk } from '../../.ds-sync/lib/common.mjs';
import { resolveDistEntry } from '../../.ds-sync/lib/bundle.mjs';
import { exportedNames, isComponentName } from '../../.ds-sync/lib/dts.mjs';

// This repo is a Next.js app, not a DS package: src/app/ holds route entries
// (pages, layouts, server components) that pull the Next server runtime and
// global stylesheets into the synth entry. The design system lives in
// src/components, src/features and src/providers.
const APP_ROUTER_RX = /(?:^|\/)src\/app\//;
const NON_IMPL_RX = /\.(stories|test|spec)\./;
const SRC_IMPL_RX = /\.(tsx|jsx)$/;
// Dir names that don't usefully group components — skip so the emitted path
// is `components/<group>/<Name>` not `components/components/<Name>`.
// 'features' added: this repo's feature slices live under src/features/<slice>/,
// so the slice name is the useful group, never the container.
const GENERIC_DIR = new Set(['components', 'component', 'src', 'lib', 'ui', 'packages', 'react', 'features']);
const slug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'general';

// No .d.ts → components come from the default-export name map (see below) plus
// PascalCase NAMED value exports. Each carries its src path so the enrichment
// pass never has to fuzzy-find a file whose name was qualified for a collision.
function deriveComponentsFromSrc(srcFiles, nameMap) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, allowJs: true, skipLibCheck: true },
  });
  const seen = new Map();
  for (const [p, name] of nameMap) seen.set(name, p);
  for (const p of srcFiles) {
    if (NON_IMPL_RX.test(p) || !SRC_IMPL_RX.test(p)) continue;
    const sf = project.addSourceFileAtPathIfExists(p);
    if (!sf) continue;
    for (const [name, decls] of sf.getExportedDeclarations()) {
      if (name === 'default' || !/^[A-Z][A-Za-z0-9]*$/.test(name) || seen.has(name)) continue;
      if (decls.some((d) => Node.isVariableDeclaration(d) || Node.isFunctionDeclaration(d) || Node.isClassDeclaration(d))) {
        seen.set(name, p);
      }
    }
  }
  return [...seen].sort(([a], [b]) => (a < b ? -1 : 1)).map(([name, srcPath]) => ({ name, group: 'general', srcPath }));
}

// Next.js components are `export default function Foo()`, which `export * from`
// does NOT re-export — without this the bundle's global carries only the handful
// of named exports.
//
// The export NAME comes from the file path, not the declared identifier: several
// components in this repo declare a copy-pasted identifier (Overlay.tsx declares
// `MainHeader`, AccountIcon.tsx declares `Account`, YouTube.tsx declares
// `Content`), which would both mis-name them and collide on the global. Path
// naming leaves exactly one true collision (Header), resolved by qualifying the
// later path with its feature dir → PostHeader.
const pascal = (s) => s.replace(/(^|[-_ ])([a-z0-9])/g, (_, __, c) => c.toUpperCase()).replace(/[-_ ]/g, '');

function exportNameFor(p) {
  const parts = slash(p).split('/');
  const base = parts.at(-1).replace(/\.(tsx|jsx)$/, '');
  return pascal(base === 'index' ? parts.at(-2) : base);
}

// Qualifier for a collided name: the nearest path segment that isn't a generic
// container — features/post/components/Header.tsx → Post.
function qualifierFor(p) {
  const parts = slash(p).split('/').slice(0, -1);
  const seg = parts.reverse().find((s) => !GENERIC_DIR.has(s.toLowerCase()) && s !== 'features' && s !== 'src');
  return seg ? pascal(seg) : '';
}

function hasDefaultExport(files) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, allowJs: true, skipLibCheck: true },
  });
  const out = new Set();
  for (const p of files) {
    const sf = project.addSourceFileAtPathIfExists(p);
    if (sf?.getExportedDeclarations().get('default')) out.add(p);
  }
  return out;
}

// The single naming authority: {file → export name} for every default-exporting
// component file. Both the synth entry and component discovery read this, so the
// component list and the bundle's global can never drift apart.
function componentNameMap(files) {
  const defaults = hasDefaultExport(files);
  const out = new Map();
  const taken = new Set();
  for (const p of [...files].sort()) {
    if (!defaults.has(p)) continue;
    let name = exportNameFor(p);
    if (taken.has(name)) {
      const q = qualifierFor(p);
      const qualified = q && !name.startsWith(q) ? q + name : name + '2';
      console.error(`  name collision: ${name} → ${qualified} for ${slash(p).split('/src/').at(-1)}`);
      name = qualified;
    }
    if (taken.has(name)) { console.error(`  ! ${name} still collides — ${p} not on the global`); continue; }
    taken.add(name);
    out.set(p, name);
  }
  return out;
}

export async function resolvePackage(ctx) {
  const { PKG_DIR, pkgJson, ENTRY_OVERRIDE, PKG, OUT, cfg } = ctx;
  const srcMap = cfg.componentSrcMap ?? {};

  // ── 1. src/ discovery (best-effort; feeds enrichment + synth-entry fallback).
  // ASSUMPTION: source root is first of src/ | lib/ | components/. Override: cfg.srcDir.
  const srcRoot = [cfg.srcDir, 'src', 'lib', 'components']
    .map((d) => d && resolve(PKG_DIR, d))
    .find((d) => d && existsSync(d));
  const srcFiles = (srcRoot ? walk(srcRoot, (n) => /\.(tsx|jsx|mdx?)$/.test(n)) : []).filter(
    (p) => !APP_ROUTER_RX.test(slash(p)),
  );

  // ── 2. entry: dist if it exists, else synthesize from src/ (last resort).
  let nameMap = new Map();
  let entry = resolveDistEntry({ pkgDir: PKG_DIR, pkgJson, override: ENTRY_OVERRIDE, pkgName: PKG, soft: true });
  let synthEntry = false;
  if (!entry) {
    if (!srcRoot) {
      console.error(`[NO_DIST] ${PKG} has no built entry and no src/ to synthesize from — run its build.`);
      process.exit(1);
    }
    const comps = srcFiles.filter((p) => SRC_IMPL_RX.test(p) && !NON_IMPL_RX.test(p));
    entry = join(OUT, '.pkg-entry.mjs');
    nameMap = componentNameMap(comps);
    // FIRST import wins module evaluation order: the Next client runtime reads
    // process.env at module scope, so the shim has to run before anything else.
    const lines = [`import ${JSON.stringify(resolve(PKG_DIR, '.design-sync/process-shim.mjs'))};`];
    for (const p of comps) {
      lines.push(`export * from ${JSON.stringify(p)};`);
      const name = nameMap.get(p);
      if (name) lines.push(`export { default as ${name} } from ${JSON.stringify(p)};`);
    }
    writeFileSync(entry, lines.join('\n') + '\n');
    synthEntry = true;
    console.error(
      `[NO_DIST] no built entry — synthesizing from ${comps.length} src files (run the package's build for best results)`,
    );
  }

  // ── 3. component list: from shipped .d.ts (authoritative when dist exists).
  // ASSUMPTION: components = PascalCase value exports in the .d.ts tree.
  // Override: cfg.componentSrcMap (non-null adds/pins, null excludes).
  const exported = exportedNames(PKG_DIR, pkgJson);
  const names = new Set([...exported].filter(isComponentName));
  for (const [k, v] of Object.entries(srcMap)) {
    if (v === null) { names.delete(k); continue; }
    // Names reach `<script>` blocks in the emitted HTML — reject anything
    // that isn't a plain PascalCase identifier.
    if (!/^[A-Z][A-Za-z0-9]*$/.test(k)) {
      console.error(`[CONFIG] componentSrcMap: "${k}" is not a valid component name (PascalCase identifiers only)`);
      continue;
    }
    names.add(k);
  }
  let components = [...names].sort().map((name) => ({ name, group: 'general' }));
  // Synth-entry mode: src IS the authority (there is no shipped .d.ts tree), so
  // derive unconditionally and let config pins merge in on top.
  if (synthEntry) {
    const derived = deriveComponentsFromSrc(srcFiles, nameMap).filter((c) => srcMap[c.name] !== null);
    const byName = new Map(derived.map((c) => [c.name, c]));
    for (const c of components) if (!byName.has(c.name)) byName.set(c.name, c);
    components = [...byName.values()].sort((a, b) => (a.name < b.name ? -1 : 1));
  }
  if (!components.length) {
    if (cfg.cssEntry || existsSync(join(PKG_DIR, 'styles.css'))) {
      console.error('[ZERO_MATCH] no component exports — treating as tokens-only DS');
      return { shape: 'package', entry, components: [], tokensOnly: true };
    }
    console.error(`[ZERO_MATCH] no PascalCase exports in ${PKG} and no styles — nothing to sync`);
    process.exit(1);
  }

  // ── 4. src/ enrichment per component. Every miss degrades to plain-dist.
  if (srcRoot) {
    for (const c of components) {
      // Pinned via config → skip fuzzy-find entirely.
      // Pin > path already resolved by the name map > fuzzy-find.
      let hit = typeof srcMap[c.name] === 'string' ? slash(resolve(PKG_DIR, srcMap[c.name])) : (c.srcPath ?? null);
      if (!hit) {
        // ASSUMPTION: <Name>.tsx | <name>/<name>.tsx | <Name>/index.tsx |
        // <kebab-name>.tsx, case-insensitive; dir-match ranks above
        // bare-file match, then prefer one that actually exports `c.name`.
        // Override: cfg.componentSrcMap.
        const kebab = c.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
        const nameRx = new RegExp(
          `(?:^|/)(?:${c.name}/(?:index|${c.name})\\.(tsx|jsx)|(?:${c.name}|${kebab})\\.(tsx|jsx))$`,
          'i',
        );
        const hits = srcFiles
          .filter((p) => nameRx.test(p) && !NON_IMPL_RX.test(p))
          .sort(
            (a, b) =>
              (b.toLowerCase().includes(`/${c.name.toLowerCase()}/`) ? 1 : 0) -
              (a.toLowerCase().includes(`/${c.name.toLowerCase()}/`) ? 1 : 0),
          );
        const exportRx = new RegExp(`export\\s+(?:default\\s+)?(?:const|let|var|function|class)\\s+${c.name}\\b`);
        hit = hits.find((p) => exportRx.test(readText(p))) ?? hits[0];
      }
      if (!hit || !existsSync(hit)) continue;
      c.srcPath = hit;
      c.doc = leadingJsdoc(readText(hit), c.name) || undefined;
      // group = last src/ path segment that isn't the component's own dir or
      // a generic container name — else JSDoc @category — else 'general'.
      c.group = slug(
        slash(relative(srcRoot, dirname(hit)))
          .split('/')
          .filter((s) => s && s.toLowerCase() !== c.name.toLowerCase() && !GENERIC_DIR.has(s.toLowerCase()))
          .at(-1)
        || (c.doc && /@category\s+(\S+)/.exec(c.doc)?.[1])
        || 'general',
      );
    }
  }

  console.error(
    `  package: ${components.length} components` +
      (srcRoot ? ` (${components.filter((c) => c.srcPath).length} src-matched)` : ' (no src/ — dist-only)'),
  );
  return { shape: 'package', entry, components, synthEntry, exported };
}
