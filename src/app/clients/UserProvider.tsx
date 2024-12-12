"use client";

import { getAuth, QueryKey } from "@/network/api";
import { GetAuthResponseParams } from "@/network/types";
import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode } from "react";

export const UserContext = createContext<GetAuthResponseParams | undefined>(
  undefined
);

export default function UserProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: [QueryKey.GetAuth],
    queryFn: getAuth,
  });

  return (
    <UserContext.Provider value={data?.data}>{children}</UserContext.Provider>
  );
}
