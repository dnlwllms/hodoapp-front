import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import getQueryClient from "@/network/getQueryClient";
import { getLines, QueryKey } from "@/network/api";
import LineList from "@/components/LineList";
import AddLineModal from "@/components/AddLineModal";
import { PageProps } from "@/network/types";

export default async function Page(
  props: PageProps<
    unknown,
    {
      selectedDate: string;
    }
  >
) {
  const searchParams = await props.searchParams;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [QueryKey.GetLines],
    queryFn: () => getLines(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LineList searchParams={searchParams} />
      <AddLineModal />
    </HydrationBoundary>
  );
}
