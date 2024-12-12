"use client";

import { addMonths, format, isBefore, lastDayOfMonth } from "date-fns";

import Link from "next/link";

import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import {
  deleteLines,
  getLines,
  getLinesDailyPriceSummary,
  getLinesTotalPriceSummary,
  MutationKey,
  QueryKey,
} from "@/network/api";
import getQueryClient from "@/network/getQueryClient";

import useQueryFilter from "@/hooks/useQueryFilter";

import { AlertContext } from "./AlertProvider";
import { ConfirmContext } from "./ConfirmProvider";
import AddLineModal from "./AddLineModal";
import Select from "./Select";
import PriceChart, { getChartData } from "./PriceChart";
import EditLineModal from "./EditLineModal";
import { UserContext } from "./UserProvider";

type Props = {
  searchParams: Record<string, unknown>;
};

export default function LineList(props: Props) {
  const { showAlert } = useContext(AlertContext);
  const { confirm } = useContext(ConfirmContext);
  const user = useContext(UserContext);

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

  const [modifyId, setModifyId] = useState<number>();

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

  const { data: summaryData, refetch: refetchSummaryData } = useQuery({
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
    onSuccess: () => refetchSummaryData(),
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

  const [toggle, setToggle] = useState(false);

  const handleDelete = async (id: number) => {
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
          await queryClient.invalidateQueries({
            queryKey: [QueryKey.GetLinesDailyPriceSummary],
          });
          await queryClient.invalidateQueries({
            queryKey: [QueryKey.GetLinesTotalPriceSummary],
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
        if (linesData.pages[0].data.list.length === 0) {
          return (
            <div className="text-center py-[134px] whitespace-pre-wrap text-gray-600 text-[22px]">{`새로운 시작!\n이번달도 으쌰으쌰!`}</div>
          );
        }
        return (
          <>
            <div className="flex items-center gap-4 justify-end px-4 pt-4">
              내가 쓴 내역만 보기
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={toggle}
                onChange={({ target: { checked } }) => setToggle(checked)}
              />
            </div>
            <ul className="flex flex-col gap-4 p-4">
              {linesData?.pages.map(({ data: { list } }) => {
                return list
                  .filter(({ creator }) => !toggle || creator.id === user?.id)
                  .map(({ id, description, date, price, creator }) => {
                    const parsedDate = new Date(date);
                    return (
                      <li
                        key={id}
                        className="flex flex-col text-gray-100 gap-[10px] p-4 bg-gray-800 rounded-[10px]"
                      >
                        <div>
                          <div className="text-gray-300 text-[14px]">
                            {format(parsedDate, "yyyy-MM-dd")}
                          </div>
                          <div className="flex justify-between items-center h-12">
                            <div className="text-lg font-bold text-[20px]">
                              {price.toLocaleString()}원
                            </div>
                            {user && user.id === creator.id && (
                              <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button">
                                  <svg width={24} height={24}>
                                    <use href="/icons/outlined/edit.svg#Outlined/Edit/more-one" />
                                  </svg>
                                </div>
                                <ul className="dropdown-content menu rounded-[6px] p-0 z-[1] w-[80px] shadow bg-gray-700">
                                  <li className="border-[1px] border-gray-500 rounded-[6px_6px_0px_0px]">
                                    <EditLineModal.Open>
                                      <button
                                        className="justify-center py-4"
                                        tabIndex={1}
                                        onClick={() => {
                                          setModifyId(id);
                                        }}
                                      >
                                        수정
                                      </button>
                                    </EditLineModal.Open>
                                  </li>
                                  <li className="border-[1px] border-gray-500 rounded-[0px_0px_6px_6px]">
                                    <button
                                      className="justify-center py-4"
                                      tabIndex={2}
                                      onClick={() => handleDelete(id)}
                                    >
                                      삭제
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 justify-between text-gray-300 text-[16px]">
                            <span>{description}</span>
                            <span>{creator.nickname}</span>
                          </div>
                        </div>
                      </li>
                    );
                  });
              })}
              <li ref={liRef} className="h-10"></li>
            </ul>
          </>
        );
      }
      case 1: {
        if (summaryData) {
          const average = summaryData.data.totalPrice / 2;

          const lessThenAverage = summaryData.data.results.filter(
            ({ totalPrice }) => totalPrice < average
          );

          return (
            <div className="py-8 px-4 flex flex-col gap-[10px] text-gray-100">
              <div className="p-4 bg-gray-800 rounded-2xl">
                <h3 className="text-[20px] font-bold mb-4">사용금액</h3>
                <div className="flex flex-col gap-[10px]">
                  {summaryData.data.results.map(
                    ({ id, nickname, totalPrice }) => {
                      return (
                        <div key={id}>
                          {nickname}: {totalPrice.toLocaleString()}원
                        </div>
                      );
                    }
                  )}
                  <p>인당 금액: {average.toLocaleString()}원</p>
                </div>
              </div>
              {lessThenAverage.length > 0 && (
                <div className="p-4 bg-gray-800 rounded-2xl">
                  <h3 className="text-[20px] font-bold mb-4">정산할 금액</h3>
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
                </div>
              )}
            </div>
          );
        }
      }
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 py-8">
        <div className="w-6 h-6">
          <svg
            width={24}
            height={24}
            onClick={() => {
              setSelectedDate((prev) => {
                return addMonths(prev, -1);
              });
            }}
          >
            <use href="/icons/outlined/arrows.svg#Outlined/Arrows/left" />
          </svg>
        </div>
        <div className="flex items-center gap-[10px]">
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
        <div
          className="w-6 h-6"
          onClick={() => {
            setSelectedDate((prev) => {
              return addMonths(prev, 1);
            });
          }}
        >
          <svg width={24} height={24}>
            <use href="/icons/outlined/arrows.svg#Outlined/Arrows/right" />
          </svg>
        </div>
      </div>
      <SummaryArea
        selectedDate={selectedDate}
        startDate={startDate}
        endDate={endDate}
        totalPrice={summaryData?.data.totalPrice}
      />
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
      <div className="fixed bottom-8 right-4">
        <AddLineModal.Open>
          <button className="btn rounded-full bg-gray-600 w-[60px] h-[60px]">
            <svg width={32} height={32} color="#FDFDFD">
              <use href="/icons/outlined/character.svg#Outlined/Character/plus" />
            </svg>
          </button>
        </AddLineModal.Open>
      </div>
      <AddLineModal />
      <EditLineModal id={modifyId} onClose={() => setModifyId(undefined)} />
    </div>
  );
}

const SummaryArea = memo(function SummaryArea(props: {
  selectedDate: Date;
  startDate: string;
  endDate: string;
  totalPrice?: number;
}) {
  const isThisMonth =
    format(new Date(), "yyyyMM") === format(props.selectedDate, "yyyyMM");
  const isBeforeDate = isBefore(
    format(props.selectedDate, "yyyyMM"),
    format(new Date(), "yyyyMM")
  );

  const lastDate = addMonths(props.selectedDate, -1);

  const lastStartDate = useMemo(() => lastDate.toISOString(), [lastDate]);
  const lastEndDate = useMemo(
    () => lastDayOfMonth(lastDate).toISOString(),
    [lastDate]
  );

  const { data: currentDailyPriceSummaryData } = useQuery({
    queryKey: [QueryKey.GetLinesDailyPriceSummary, props.selectedDate],
    queryFn: () =>
      getLinesDailyPriceSummary({
        startDate: props.startDate,
        endDate: props.endDate,
      }),
  });

  const { data: lastDailyPriceSummaryData } = useQuery({
    queryKey: [QueryKey.GetLinesDailyPriceSummary, lastDate],
    queryFn: () =>
      getLinesDailyPriceSummary({
        startDate: lastStartDate,
        endDate: lastEndDate,
      }),
  });

  const diffPrice = useMemo(() => {
    if (currentDailyPriceSummaryData && lastDailyPriceSummaryData) {
      const todayDate = new Date().getDate();

      const current = getChartData(currentDailyPriceSummaryData?.data).filter(
        ({ x }) => (isThisMonth ? x <= todayDate : true)
      );

      const last = getChartData(lastDailyPriceSummaryData.data).filter(
        ({ x }) => {
          return isThisMonth ? x <= todayDate : true;
        }
      );

      return (
        (current[current.length - 1].y || 0) - (last[last.length - 1].y || 0)
      );
    }

    return 0;
  }, [currentDailyPriceSummaryData, isThisMonth, lastDailyPriceSummaryData]);

  const renderComment = () => {
    if (isThisMonth) {
      return (
        <p className="text-gray-100">
          지난 달 보다{" "}
          <b className="text-primary">
            {Math.abs(diffPrice).toLocaleString()}원{" "}
            {diffPrice > 0 ? "더" : "덜"}
          </b>{" "}
          쓰는 중
        </p>
      );
    } else {
      return (
        <p className="text-gray-100">
          {props.selectedDate.getMonth() || 12}월 보다{" "}
          <b className="text-primary">
            {Math.abs(diffPrice).toLocaleString()}원{" "}
            {diffPrice > 0 ? "더" : "덜"}
          </b>{" "}
          썼어요
        </p>
      );
    }
  };

  return (
    <div className="px-4 pb-8">
      <div className="flex justify-between">
        {typeof props.totalPrice === "number" && (
          <div>
            <div className="text-[16px] text-gray-100">총 사용 금액</div>
            <div className="text-[28px] text-primary font-bold">
              {props.totalPrice.toLocaleString()}원
            </div>
          </div>
        )}
        <div className="w-[120px]">
          {currentDailyPriceSummaryData && lastDailyPriceSummaryData && (
            <PriceChart
              current={currentDailyPriceSummaryData.data}
              last={lastDailyPriceSummaryData.data}
              selectedDate={props.selectedDate}
            />
          )}
        </div>
      </div>
      {diffPrice !== 0 && (isBeforeDate || isThisMonth) && renderComment()}
    </div>
  );
});
