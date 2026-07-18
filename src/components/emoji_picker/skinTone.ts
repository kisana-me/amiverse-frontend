import { EmojiType } from '@/types/emoji'

export type SkinToneId =
  | 'light_skin_tone'
  | 'medium_light_skin_tone'
  | 'medium_skin_tone'
  | 'medium_dark_skin_tone'
  | 'dark_skin_tone'

// セレクターの表示順（薄い→濃い）と、スウォッチに使う肌色モディファイア文字
export const SKIN_TONE_DISPLAY: { id: SkinToneId; modifier: string }[] = [
  { id: 'light_skin_tone', modifier: '\u{1F3FB}' },
  { id: 'medium_light_skin_tone', modifier: '\u{1F3FC}' },
  { id: 'medium_skin_tone', modifier: '\u{1F3FD}' },
  { id: 'medium_dark_skin_tone', modifier: '\u{1F3FE}' },
  { id: 'dark_skin_tone', modifier: '\u{1F3FF}' },
]

// name_id サフィックスの判定順。medium_light は light を、medium_dark は dark を
// 含んでしまうため、長いサフィックスから先に判定する必要がある。
const MATCH_ORDER = [...SKIN_TONE_DISPLAY].sort((a, b) => b.id.length - a.id.length)

// name_id 末尾の肌色サフィックスを剥がして { base, tone } を返す。無ければ null。
export function parseSkinTone(nameId: string): { base: string; tone: SkinToneId } | null {
  for (const t of MATCH_ORDER) {
    const suffix = `_${t.id}`
    if (nameId.endsWith(suffix)) {
      return { base: nameId.slice(0, -suffix.length), tone: t.id }
    }
  }
  return null
}

/**
 * 肌色バリアントを畳んだ表示用リストを作る。
 *
 * 「👋 👋🏻 👋🏼 👋🏽 👋🏾 👋🏿」のように同じ形の絵文字は、選択中の肌色 1 つ
 * （未選択ならデフォルトの黄色）だけを表示する。
 *
 * 単一の肌色サフィックスを持ち、その base が同グループに存在し、base 自身が
 * 肌色バリアントでない単純なケースのみ畳む。二人組の複合トーン（両手が別々の
 * 肌色など）はそのまま表示する。
 */
export function buildToneDisplay(emojis: EmojiType[], selectedTone: SkinToneId | null) {
  const ids = new Set(emojis.map((e) => e.name_id))
  const variantIds = new Set<string>()
  const variantsByBase = new Map<string, Partial<Record<SkinToneId, EmojiType>>>()
  let hasSkinTone = false

  for (const e of emojis) {
    const parsed = parseSkinTone(e.name_id)
    if (parsed && ids.has(parsed.base) && !parseSkinTone(parsed.base)) {
      variantIds.add(e.name_id)
      let byTone = variantsByBase.get(parsed.base)
      if (!byTone) {
        byTone = {}
        variantsByBase.set(parsed.base, byTone)
      }
      byTone[parsed.tone] = e
      hasSkinTone = true
    }
  }

  const display: EmojiType[] = []
  for (const e of emojis) {
    if (variantIds.has(e.name_id)) continue
    const byTone = variantsByBase.get(e.name_id)
    const toned = byTone && selectedTone ? byTone[selectedTone] : undefined
    display.push(toned ?? e)
  }

  return { display, hasSkinTone }
}
