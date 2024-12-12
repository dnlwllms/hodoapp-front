"use client";

import { format } from "date-fns";

import {
  cloneElement,
  FormEvent,
  ReactElement,
  useContext,
  useState,
} from "react";

import { useMutation } from "@tanstack/react-query";

import getQueryClient from "@/network/getQueryClient";
import { MutationKey, postLines, QueryKey } from "@/network/api";

import { AlertContext } from "@/app/clients/AlertProvider";

const dialogId = "add_line_modal";

const handleDialog = (type: "open" | "close") => {
  const dialog = document.getElementById(dialogId);

  if (dialog instanceof HTMLDialogElement) {
    switch (type) {
      case "open": {
        dialog.showModal();
        document.getElementById("add-line-form-price")?.focus();
        break;
      }
      case "close": {
        dialog.close();
        break;
      }
    }
  }
};

export default function AddLineModal() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [price, setPrice] = useState(1000);
  const [description, setDescription] = useState("");

  const handleReset = () => {
    setDate(format(new Date(), "yyyy-MM-dd"));
    setPrice(1000);
    setDescription("");
  };

  const { showAlert } = useContext(AlertContext);

  const { mutateAsync, isPending } = useMutation({
    mutationKey: [MutationKey.PostLine],
    mutationFn: postLines,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!date) {
      showAlert({
        type: "error",
        message: "날짜를 선택하세요.",
      });

      return;
    }

    await mutateAsync({ date, description, price });

    handleReset();

    showAlert({
      type: "success",
      message: "내역이 추가되었습니다.",
    });

    handleDialog("close");

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
  };

  return (
    <dialog id={dialogId} className="modal">
      <div className="modal-box bg-gray-900">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-end">
            <button type="button" onClick={() => handleDialog("close")}>
              <svg width={24} height={24} color="#FDFDFD">
                <use href="/icons/outlined/character.svg#Outlined/Character/close-small" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-8">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">날짜</span>
              </div>
              <input
                id="add-line-form-date"
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
                id="add-line-form-price"
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
                id="add-line-form-description"
                name="description"
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={description}
                onChange={({ target: { value } }) => setDescription(value)}
              />
            </label>
          </div>
          <div className="modal-action mt-8">
            <button
              type="submit"
              className="btn w-full bg-gray-100 text-gray-900"
              disabled={isPending}
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

AddLineModal.Open = function Open({ children }: { children: ReactElement }) {
  return cloneElement(children, {
    onClick: () => {
      if (children.props.onClick) {
        children.props.onClick();
      }
      handleDialog("open");
    },
  });
};
