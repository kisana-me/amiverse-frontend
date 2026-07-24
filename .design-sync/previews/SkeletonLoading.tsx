import { SkeletonLoading } from 'Amiverse'

export const Default = () => <SkeletonLoading />

export const TextLines = () => (
  <div>
    <SkeletonLoading width="80%" height="16px" />
    <SkeletonLoading width="95%" height="16px" />
    <SkeletonLoading width="60%" height="16px" />
  </div>
)

export const Avatar = () => <SkeletonLoading width="48px" height="48px" borderRadius="100%" />
