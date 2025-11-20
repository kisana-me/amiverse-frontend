"use client";

import Link from 'next/link'
import Item, { ItemType } from './item'
import SkeletonItem from './skeleton_item'

type ItemsType = {
  items: ItemType[];
  loadItems?: boolean;
}

export default function Items({ items = [], loadItems = false }: ItemsType) {

  return (
    <>
      <div className="items">
        {(() => {
          if (loadItems) {
            return (
              <>
                {[...Array(20)].map((_, index) => (
                  <SkeletonItem key={index} />
                ))}
              </>
            )
          } else if (items.length > 0) {
            return (
              <>
                {items.map(item => (
                  <Item key={item.aid} item={item} />
                ))}
              </>
            )
          } else {
            return (
              <>
                <p>アイテムはありません。</p>
              </>
            )
          }
        })()}
      </div>
    </>
  )
}
