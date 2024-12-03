'use client';

import Link from 'next/link';

import { useContext, useEffect, useRef, useState } from 'react';
import { format, lastDayOfMonth } from 'date-fns';

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { AlertContext } from './AlertProvider';
import { ConfirmContext } from './ConfirmProvider';
import { AddLineModalButton } from './AddLineModal';

import { deleteLines, getLines, MutationKey, QueryKey } from '@/network/api';
import getQueryClient from '@/network/getQueryClient';

export default function LineList() {
  const { confirm } = useContext(ConfirmContext);
  const { showAlert } = useContext(AlertContext);

  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth();

  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(thisYear, thisMonth, 1),
  );

  const [tab, setTab] = useState(0);

  const {
    data: queryData,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [QueryKey.GetLines, selectedDate],
    queryFn: ({ pageParam }) =>
      getLines({
        page: pageParam,
        startDate: selectedDate.toISOString(),
        endDate: lastDayOfMonth(selectedDate).toISOString(),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { limit, page, total } = lastPage.data.pagination;

      return page < total / limit ? page + 1 : undefined;
    },
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
      message: '정말 삭제하시겠습니까?',
      callback: async () => {
        try {
          await deleteLine(id);

          showAlert({ type: 'success', message: '삭제되었습니다.' });

          const queryClient = getQueryClient();

          await queryClient.invalidateQueries({
            queryKey: [QueryKey.GetLines],
          });
        } catch {
          showAlert({
            type: 'error',
            message: '내가 등록한 내역만 삭제할 수 있습니다.',
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

  // TODO: TotalPrice API 개발 필요
  // const totalPrice = queryData?.data?.list.reduce(
  //   (prev, current) => prev + current.price,
  //   0,
  // );

  const renderByTab = () => {
    switch (tab) {
      case 0: {
        return (
          <ul className="flex flex-col gap-4 p-4">
            {queryData?.pages.map(({ data: { list } }) => {
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
                          <div>{format(parsedDate, 'yyyy-MM-dd')}</div>
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
        // const groupByCreator = groupBy(
        //   queryData.data.list,
        //   (a) => a.creator.id,
        // );
        // const entries: [string, number][] = Object.values(groupByCreator).map(
        //   (arr) => {
        //     return [
        //       arr[0].creator.nickname,
        //       arr.reduce((prev, current) => prev + current.price, 0),
        //     ];
        //   },
        // );
        // const average = totalPrice / entries.length;
        // return (
        //   <div className="p-4">
        //     <h3 className="text-xl font-bold mb-4">사용 금액</h3>
        //     <div>
        //       {entries.map(([name, price], index) => {
        //         return (
        //           <div key={index}>
        //             {name}: {price.toLocaleString()}
        //           </div>
        //         );
        //       })}
        //     </div>
        //     <p>인당 금액: {average.toLocaleString()}</p>
        //     <h3 className="text-xl font-bold my-4">정산할 금액</h3>
        //     {entries
        //       .filter((entry) => entry[1] < average)
        //       .map(([name, price], index) => {
        //         return (
        //           <div key={index}>
        //             {name}: {(average - price).toLocaleString()}원
        //           </div>
        //         );
        //       })}
        //   </div>
        // );
      }
    }
  };

  return (
    <div className="mb-10">
      <div className="mb-4">
        <div className="flex items-center">
          <select
            className="select"
            value={selectedDate.getFullYear()}
            onChange={({ target: { value } }) => {
              const newDate = new Date(
                Number(value),
                selectedDate.getMonth(),
                1,
              );
              setSelectedDate(newDate);
            }}
          >
            {[thisYear - 1, thisYear, thisYear + 1].map((value) => {
              return <option key={value}>{value}</option>;
            })}
          </select>
          년
          <select
            className="select"
            value={selectedDate.getMonth() + 1}
            onChange={({ target: { value } }) => {
              const newDate = new Date(
                selectedDate.getFullYear(),
                Number(value) - 1,
                1,
              );
              setSelectedDate(newDate);
            }}
          >
            {Array.from({ length: 12 }).map((_, index) => {
              return <option key={index}>{index + 1}</option>;
            })}
          </select>
          월
        </div>
      </div>
      <div className="stats stats-vertical shadow w-full">
        <div className="stat">
          <div className="stat-title">총 사용금액</div>
          {/* <div className="stat-value mb-1">{totalPrice.toLocaleString()}원</div> */}
          <div className="stat-desc">
            {format(selectedDate, 'yyyy년 MM월 1일')} ~{' '}
            {format(selectedDate, 'yyyy년 MM월')}{' '}
            {lastDayOfMonth(selectedDate).getDate()}일
          </div>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered">
        <a
          role="tab"
          className={`tab${tab === 0 ? ' tab-active' : ''}`}
          onClick={() => setTab(0)}
        >
          목록
        </a>
        <a
          role="tab"
          className={`tab${tab === 1 ? ' tab-active' : ''}`}
          onClick={() => setTab(1)}
        >
          정산
        </a>
      </div>
      {renderByTab()}
      <div className="fixed bottom-24 right-4">
        <AddLineModalButton />
      </div>
    </div>
  );
}
