import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import getQueryClient from '@/network/getQueryClient';
import { getLines, QueryKey } from '@/network/api';
import LineList from '@/components/LineList';
import AddLineModal from '@/components/AddLineModal';

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [QueryKey.GetLines],
    queryFn: () => getLines(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LineList />
      <AddLineModal />
    </HydrationBoundary>
  );
}
