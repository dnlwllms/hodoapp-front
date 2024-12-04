"use client";

import { format, lastDayOfMonth } from "date-fns";

import Link from "next/link";

import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import {
  deleteLines,
  getLines,
  getLinesTotalPriceSummary,
  MutationKey,
  QueryKey,
} from "@/network/api";
import getQueryClient from "@/network/getQueryClient";

import useQueryFilter from "@/hooks/useQueryFilter";

import { AlertContext } from "./AlertProvider";
import { ConfirmContext } from "./ConfirmProvider";
import { AddLineModalButton } from "./AddLineModal";
import Select from "./Select";

type Props = {
  searchParams: Record<string, unknown>;
};

export default function LineList(props: Props) {
  const { confirm } = useContext(ConfirmContext);
  const { showAlert } = useContext(AlertContext);

  const parsedSearchParamSelectedDate = new Date(
    String(props.searchParams.selectedDate)
  );

  const today = !Number.isNaN(parsedSearchParamSelectedDate.getTime())
    ? parsedSearchParamSelectedDate
    : new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth();

  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(thisYear, thisMonth, 1)
  );

  const startDate = useMemo(() => selectedDate.toISOString(), [selectedDate]);
  const endDate = useMemo(
    () => lastDayOfMonth(selectedDate).toISOString(),
    [selectedDate]
  );

  const [tab, setTab] = useState(
    props.searchParams.tab && !Number.isNaN(props.searchParams.tab)
      ? Number(props.searchParams.tab)
      : 0
  );

  useQueryFilter({
    tab,
    selectedDate: selectedDate.toISOString(),
  });

  const {
    data: linesData,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [QueryKey.GetLines, selectedDate],
    queryFn: ({ pageParam }) =>
      getLines({
        page: pageParam,
        startDate,
        endDate,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { limit, page, total } = lastPage.data.pagination;

      return page < total / limit ? page + 1 : undefined;
    },
  });

  const { data: summaryData } = useQuery({
    queryKey: [QueryKey.GetLinesTotalPriceSummary, selectedDate],
    queryFn: () =>
      getLinesTotalPriceSummary({
        startDate,
        endDate,
      }),
  });

  const { mutateAsync: deleteLine } = useMutation({
    mutationKey: [MutationKey.DeleteLine],
    mutationFn: deleteLines,
  });

  const liRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      });
    }, {});

    if (hasNextPage && liRef.current) {
      observer.observe(liRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage]);

  const handleDelete = async (id: string) => {
    confirm({
      message: "정말 삭제하시겠습니까?",
      callback: async () => {
        try {
          await deleteLine(id);

          showAlert({ type: "success", message: "삭제되었습니다." });

          const queryClient = getQueryClient();

          await queryClient.invalidateQueries({
            queryKey: [QueryKey.GetLines],
          });
        } catch {
          showAlert({
            type: "error",
            message: "내가 등록한 내역만 삭제할 수 있습니다.",
          });
        }
      },
    });
  };

  if (isPending) {
    return (
      <div className="p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <p className="mb-4">권한이 없습니다.</p>
        <Link href="/login">
          <button className="btn w-full">로그인 화면으로 돌아가기</button>
        </Link>
      </div>
    );
  }

  const renderByTab = () => {
    switch (tab) {
      case 0: {
        return (
          <ul className="flex flex-col gap-4 p-4">
            {linesData?.pages.map(({ data: { list } }) => {
              return list.map(({ id, description, date, price, creator }) => {
                const parsedDate = new Date(date);

                return (
                  <li key={id}>
                    <div className="px-4 pt-2 pb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg">{description}</span>
                        <div className="dropdown dropdown-end">
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-circle"
                          >
                            <svg width={24} height={24}>
                              <use href="/icons/outlined/edit.svg#Outlined/Edit/more-one" />
                            </svg>
                          </div>
                          <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-24 p-2 shadow">
                            <li>
                              <button
                                tabIndex={1}
                                onClick={() => handleDelete(id.toString())}
                              >
                                삭제
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        {price.toLocaleString()}원
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="text-right text-gray-500">
                          <div>{creator.nickname}</div>
                          <div>{format(parsedDate, "yyyy-MM-dd")}</div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              });
            })}
            <li ref={liRef} className="h-10"></li>
          </ul>
        );
      }
      case 1: {
        if (summaryData) {
          const average = summaryData.data.totalPrice / 2;

          const lessThenAverage = summaryData.data.results.filter(
            ({ totalPrice }) => totalPrice < average
          );

          return (
            <div className="p-4">
              <h3 className="text-xl font-bold mb-4">사용 금액</h3>
              <div>
                {summaryData.data.results.map(
                  ({ id, nickname, totalPrice }) => {
                    return (
                      <div key={id}>
                        {nickname}: {totalPrice.toLocaleString()}
                      </div>
                    );
                  }
                )}
              </div>
              <p>인당 금액: {average.toLocaleString()}</p>
              {lessThenAverage.length > 0 && (
                <>
                  <h3 className="text-xl font-bold my-4">정산할 금액</h3>
                  {summaryData.data.results
                    .filter(({ totalPrice }) => totalPrice < average)
                    .map(({ id, nickname, totalPrice }) => {
                      return (
                        <div key={id}>
                          {nickname}: {(average - totalPrice).toLocaleString()}
                          원
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          );
        }
      }
    }
  };

  return (
    <div className="mb-10">
      <div className="mb-4">
        <div className="flex items-center px-4 py-8 gap-[10px]">
          <Select
            value={selectedDate.getFullYear()}
            onChange={({ target: { value } }) => {
              const newDate = new Date(
                Number(value),
                selectedDate.getMonth(),
                1
              );
              setSelectedDate(newDate);
            }}
          >
            {[thisYear - 1, thisYear, thisYear + 1].map((value) => {
              return (
                <option key={value} value={value}>
                  {value}년
                </option>
              );
            })}
          </Select>
          <Select
            value={selectedDate.getMonth() + 1}
            onChange={({ target: { value } }) => {
              const newDate = new Date(
                selectedDate.getFullYear(),
                Number(value) - 1,
                1
              );
              setSelectedDate(newDate);
            }}
          >
            {Array.from({ length: 12 }).map((_, index) => {
              return (
                <option key={index} value={index + 1}>
                  {index + 1}월
                </option>
              );
            })}
          </Select>
        </div>
      </div>
      <div className="px-4 pb-8">
        {summaryData && (
          <>
            <div className="text-[16px] text-gray-100">총 사용 금액</div>
            <div className="text-[28px] text-[#E1FF5A] font-bold">
              {summaryData.data.totalPrice.toLocaleString()}원
            </div>
          </>
        )}
      </div>
      <div role="tablist" className="tabs tabs-bordered">
        <a
          role="tab"
          className={`tab${tab === 0 ? " tab-active" : ""}`}
          onClick={() => setTab(0)}
        >
          사용내역
        </a>
        <a
          role="tab"
          className={`tab${tab === 1 ? " tab-active" : ""}`}
          onClick={() => setTab(1)}
        >
          정산
        </a>
      </div>
      {renderByTab()}
      <div className="fixed bottom-[104px] right-4">
        <AddLineModalButton />
      </div>
    </div>
  );
}
