"use client";

import { format } from "date-fns";

import {
  cloneElement,
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import getQueryClient from "@/network/getQueryClient";
import { getLine, MutationKey, putLines, QueryKey } from "@/network/api";

import { AlertContext } from "./AlertProvider";

const id = "edit_line_modal";

const handleDialog = (type: "open" | "close") => {
  const dialog = document.getElementById(id);

  if (dialog instanceof HTMLDialogElement) {
    switch (type) {
      case "open": {
        dialog.showModal();
        document.getElementById("edit-line-form-price")?.focus();
        break;
      }
      case "close": {
        dialog.close();
        break;
      }
    }
  }
};

export default function EditLineModal(props: {
  id?: number;
  onClose: () => void;
}) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [price, setPrice] = useState(1000);
  const [description, setDescription] = useState("");

  const handleReset = () => {
    setDate(format(new Date(), "yyyy-MM-dd"));
    setPrice(1000);
    setDescription("");
  };

  const { showAlert } = useContext(AlertContext);

  const {
    data,
    isSuccess,
    isPending: isDetailPending,
    isError: isDetailError,
  } = useQuery({
    queryKey: [QueryKey.GetLine, props.id],
    queryFn: () => (props.id ? getLine(props.id) : null),
    enabled: !!props.id,
  });

  useEffect(() => {
    if (data?.data) {
      setDate(format(data.data.date, "yyyy-MM-dd"));
      setPrice(data.data.price);
      setDescription(data.data.description);
    }
  }, [data, isSuccess]);

  const { mutateAsync, isPending } = useMutation({
    mutationKey: [MutationKey.PutLine],
    mutationFn: putLines,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      if (props.id) {
        e.preventDefault();

        if (!date) {
          showAlert({
            type: "error",
            message: "날짜를 선택하세요.",
          });

          return;
        }

        await mutateAsync({ id: props.id, date, description, price });

        handleReset();

        showAlert({
          type: "success",
          message: "내역이 수정되었습니다.",
        });

        handleClose();

        const queryClient = getQueryClient();

        await queryClient.invalidateQueries({
          queryKey: [QueryKey.GetLines],
        });
        await queryClient.invalidateQueries({
          queryKey: [QueryKey.GetLinesTotalPriceSummary],
        });
        await queryClient.invalidateQueries({
          queryKey: [QueryKey.GetLinesDailyPriceSummary],
        });
        await queryClient.invalidateQueries({
          queryKey: [QueryKey.GetLine, props.id],
        });
      }
    } catch (e) {
      showAlert({
        type: "error",
        message: String(e),
      });
    }
  };

  const handleClose = () => {
    props.onClose();
    handleDialog("close");
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box bg-gray-900">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-end">
            <button type="button" onClick={handleClose}>
              <svg width={24} height={24} color="#FDFDFD">
                <use href="/icons/outlined/character.svg#Outlined/Character/close-small" />
              </svg>
            </button>
          </div>
          {isDetailError ? (
            <p>데이터를 불러올 수 없습니다.</p>
          ) : (
            <>
              {isDetailPending ? (
                <div className="flex w-full flex-col gap-4 pt-4">
                  <div className="skeleton h-32 w-full"></div>
                  <div className="skeleton h-4 w-28"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-full"></div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-8">
                    <label className="form-control w-full max-w-xs">
                      <div className="label">
                        <span className="label-text">날짜</span>
                      </div>
                      <input
                        id="edit-line-form-date"
                        name="date"
                        type="date"
                        className="input input-bordered w-full max-w-xs"
                        value={date}
                        autoFocus={false}
                        onChange={({ target: { value } }) => setDate(value)}
                      />
                    </label>
                    <label className="form-control w-full max-w-xs">
                      <div className="label">
                        <span className="label-text">사용 금액</span>
                      </div>
                      <input
                        id="edit-line-form-price"
                        name="price"
                        type="text"
                        inputMode="numeric"
                        className="input input-bordered w-full max-w-xs"
                        value={price.toLocaleString()}
                        onChange={({ target: { value } }) => {
                          const parsedValue = Number(value.replace(/,/g, ""));

                          if (!Number.isNaN(parsedValue)) {
                            setPrice(parsedValue);
                          }
                        }}
                        onFocus={(e) => {
                          e.target.select();
                        }}
                      />
                    </label>
                    <label className="form-control w-full max-w-xs">
                      <div className="label">
                        <span className="label-text">내용</span>
                      </div>
                      <input
                        id="edit-line-form-description"
                        name="description"
                        type="text"
                        className="input input-bordered w-full max-w-xs"
                        value={description}
                        onChange={({ target: { value } }) =>
                          setDescription(value)
                        }
                      />
                    </label>
                  </div>
                  <div className="modal-action mt-8">
                    <button
                      type="submit"
                      className="btn w-full bg-gray-100 text-gray-900"
                      disabled={isPending}
                    >
                      수정
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </dialog>
  );
}

EditLineModal.Open = function Open({ children }: { children: ReactElement }) {
  return cloneElement(children, {
    onClick: () => {
      if (children.props.onClick) {
        children.props.onClick();
      }
      handleDialog("open");
    },
  });
};
