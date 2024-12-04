"use client";

import { format } from "date-fns";

import { FormEvent, useContext, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import getQueryClient from "@/network/getQueryClient";
import { MutationKey, postLines, QueryKey } from "@/network/api";

import { AlertContext } from "./AlertProvider";

const id = "add_line_modal";

const handleDialog = (type: "open" | "close") => {
  const dialog = document.getElementById(id);

  if (dialog instanceof HTMLDialogElement) {
    switch (type) {
      case "open": {
        dialog.showModal();
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
  const [date, setDate] = useState(new Date().toISOString());
  const [price, setPrice] = useState(1000);
  const [description, setDescription] = useState("");

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
        message: "가계부 이름을 입력하세요.",
      });

      return;
    }

    await mutateAsync({ date, description, price });

    (e.target as HTMLFormElement).reset();

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
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold">내역 추가</h3>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">날짜</span>
            </div>
            <input
              type="date"
              className="input input-bordered w-full max-w-xs"
              value={format(new Date(date), "yyyy-MM-dd")}
              onChange={({ target: { value } }) =>
                setDate(new Date(value).toISOString())
              }
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">금액</span>
            </div>
            <input
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
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">메모</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              onChange={({ target: { value } }) => setDescription(value)}
            />
          </label>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleDialog("close")}
            >
              닫기
            </button>
            <button type="submit" className="btn" disabled={isPending}>
              추가
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function AddLineModalButton() {
  return (
    <button
      onClick={() => handleDialog("open")}
      className="btn rounded-full bg-gray-600 w-[60px] h-[60px]"
    >
      <svg width={32} height={32} color="#FDFDFD">
        <use href="/icons/outlined/character.svg#Outlined/Character/plus" />
      </svg>
    </button>
  );
}
