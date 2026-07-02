'use client'

import { use } from 'react'
import FollowsView from '@/features/account/components/FollowsView'

type Props = {
  params: Promise<{
    name_id: string
  }>
}

export default function Page({ params }: Props) {
  const { name_id } = use(params)
  return <FollowsView name_id={name_id} initialTab="followers" key={name_id} />
}
