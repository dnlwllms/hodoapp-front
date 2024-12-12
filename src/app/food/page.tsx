import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getLines, QueryKey } from "@/network/api";
import getQueryClient from "@/network/getQueryClient";

import BottomNavigation from "@/app/clients/BottomNavigation";
import Calendar from "../clients/Calendar";

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [QueryKey.GetLines],
    queryFn: () => getLines(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Calendar />
      <BottomNavigation />
    </HydrationBoundary>
  );
}
