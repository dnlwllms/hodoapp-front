"use client";

import queryString from "query-string";

import { useRouter, useSearchParams } from "next/navigation";

import { useEffect } from "react";

export default function useQueryFilter<T extends Record<string, unknown>>(
  filter: T
) {
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const isEqual = searchParams.toString() === queryString.stringify(filter);

      if (!isEqual) {
        const parsedQuery = queryString.parse(searchParams.toString());

        Object.assign(parsedQuery, filter);

        replace(`?${queryString.stringify(parsedQuery)}`);
      }
    } catch {
      console.error("Invalid Query Object");
    }
  }, [replace, searchParams, filter]);
}
