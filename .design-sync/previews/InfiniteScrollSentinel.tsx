import { InfiniteScrollSentinel } from 'Amiverse'

// The idle state renders nothing by design (it is an intersection sentinel), so
// only the loading state is worth a cell.
export const Loading = () => <InfiniteScrollSentinel onIntersect={() => {}} isLoading />
