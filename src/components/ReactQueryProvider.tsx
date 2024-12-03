"use client";

import { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import getQueryClient from "@/network/getQueryClient";

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
