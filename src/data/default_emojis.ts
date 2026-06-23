import { EmojiType } from '@/types/emoji'

import smileysAndEmotion from './emojis/smileys-emotion.json'
import peopleAndBody from './emojis/people-body.json'
import animalsAndNature from './emojis/animals-nature.json'
import foodAndDrink from './emojis/food-drink.json'
import activities from './emojis/activities.json'
import travelAndPlaces from './emojis/travel-places.json'
import objects from './emojis/objects.json'
import symbols from './emojis/symbols.json'
import flags from './emojis/flags.json'

export const defaultEmojisByGroup: Record<string, EmojiType[]> = {
  'Smileys & Emotion': smileysAndEmotion,
  'People & Body': peopleAndBody,
  'Animals & Nature': animalsAndNature,
  'Food & Drink': foodAndDrink,
  Activities: activities,
  'Travel & Places': travelAndPlaces,
  Objects: objects,
  Symbols: symbols,
  Flags: flags,
}

export const defaultEmojiGroups: string[] = Object.keys(defaultEmojisByGroup)

export const defaultEmojiCache: Record<string, EmojiType> = Object.values(defaultEmojisByGroup).reduce(
  (acc, emojis) => {
    emojis.forEach((emoji) => {
      acc[emoji.name_id] = emoji
    })
    return acc
  },
  {} as Record<string, EmojiType>,
)
