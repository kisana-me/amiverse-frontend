## Amiverse conventions

Amiverse is a Japanese social app (posts, accounts, communities, drawings). All
UI copy is Japanese — write Japanese labels, not English.

### Wrapping: every tree needs `DesignRoot`

These are Next.js app-router client components. They call `useRouter()` /
`usePathname()` and read theme + UI state from React context. Outside a running
Next app both are missing and the tree throws
`invariant expected app router to be mounted` — **the whole design renders
blank, with no visible error**. `window.Amiverse.DesignRoot` supplies a
navigation-free router stand-in plus the full provider chain (`UIProvider` →
`OverlayProvider` → `ToastProvider` → `CurrentAccountProvider` →
`PostsProvider` → `EmojiProvider`). Wrap once, at the root:

```jsx
const { DesignRoot, ListedPost, MainHeader } = window.Amiverse

<DesignRoot>
  <MainHeader><span style={{ fontWeight: 700 }}>ホーム</span></MainHeader>
  <div style={{ maxWidth: 700, margin: '0 auto', borderInline: '1px solid var(--border-color)' }}>
    {posts.map((post) => <ListedPost key={post.aid} post={post} />)}
  </div>
</DesignRoot>
```

Never nest a second `DesignRoot`, and never use `UIProvider` alone — it carries
the colors but not the router, so router-dependent components still blank out.

### Styling: CSS custom properties are the design language

There is no theme prop and no component-level style API. Colors, spacing hooks
and type scale all come from CSS custom properties that `UIProvider` injects and
`styles.css` mirrors. Use `var(--…)` in your own inline styles and CSS; they
switch automatically between light and dark.

| Token | Use |
|---|---|
| `--background-color` | page / surface background |
| `--font-color` | primary text |
| `--inconspicuous-font-color` | secondary text, timestamps, counts |
| `--inconspicuous-background-color` | subtle fills, chips, disabled surfaces |
| `--border-color` | all borders and dividers |
| `--link-color` | links, mentions, hashtags, active state |
| `--attention-color` | destructive / warning (`#f4212e`) |
| `--hover-color` | hover fills |
| `--button-color` / `--button-font-color` | filled button background / its label |
| `--blur-color` | translucent overlay behind blurred bars |
| `--shadow-color` | shadows |
| `--font-size-base` | root type size (14/16/18px by user setting) |
| `--primary-hue` | brand hue, for `hsl(var(--primary-hue) …)` |

Aliases also resolve: `--text-primary`, `--text-secondary`, `--bg-color`,
`--bg-secondary`, `--main-container-background-color`.

**`--content-color` is retired. Do not use it** — it is not defined anywhere in
this system. Use `--background-color` or `--inconspicuous-background-color`.

### Tailwind is present but only as a fixed subset

Components mix CSS Modules with Tailwind v4 utilities, and `_ds_bundle.css`
carries a Tailwind build compiled **only from the classes the app itself uses** —
`flex`, `grid`, `relative`, `absolute`, `hidden`, `w-full`, `items-center`,
`justify-between`, `gap-2`, `gap-4`, `px-4`, `py-2`, `text-sm`, `text-lg`,
`font-bold`, `rounded-md`, `rounded-full`, `overflow-hidden`, `bg-red-500`,
`text-white` and similar. **A utility that is not in that build silently does
nothing.** For your own layout glue prefer inline styles with `var(--…)`; reach
for a utility class only when you have confirmed it exists in
`_ds/<folder>/_ds_bundle.css`.

### Components that need the real app

Some components load assets the Amiverse server hosts, so they show a broken
image in a design:

- `MainHeader`, `Header`, `InitialLoading` hard-code the logo
  (`/static-assets/images/amiverse-logo-alpha-400.png`) and cannot be pointed
  elsewhere — accept the gap or avoid them in image-critical designs.
- Every avatar/banner surface (`Account`, `AccountIcon`, `AccountPlate`,
  `AccountBanner`, `AccountMainHeader`, `OneLine`, `Quote`, `Diffuse`,
  `CommunityPlate`, `CommunityBanner`, `PostForm`) falls back to `/ast-imgs/*`
  when `icon_url` / `banner_url` is empty, so **always pass a real image URL**.

### Data shapes

`ListedPost`, `FeaturedPost` and every `post/*` component take a single `post`
prop (`PostType`); account components take `account` (`AccountType`). Fields that
change what renders: `post.rating` (`general` shows content, `nsfw` shows a
"センシティブな内容" gate, `r18` shows an age gate), `post.visibility` (must be
one of `opened` / `closed` / `limited` / `followers_only` / `direct_only` —
anything else renders 公開状態不明), `post.reactions[].name` (the emoji
character itself), `post.reply` / `post.quote` (nested posts). Exact fields are
in each `<Name>.d.ts`.

### Where to look

Read `_ds/<folder>/styles.css` and the `_ds_bundle.css` it imports for the real
declarations, and `components/<group>/<Name>/<Name>.prompt.md` before using a
component you have not used before.
