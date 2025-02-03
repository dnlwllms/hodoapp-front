"use client";

import { createContext, ReactNode, useState } from "react";

type ConfirmInfo = {
  message: string;
  callback: () => void;
};

const id = "confirm_modal";

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

export const ConfirmContext = createContext<{
  confirm: (confirmInfo: ConfirmInfo) => void;
}>({ confirm: () => {} });

export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmInfo, setConfirmInfo] = useState<ConfirmInfo>();

  const confirm = (confirmInfo: ConfirmInfo) => {
    setConfirmInfo(confirmInfo);
    handleDialog("open");
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <dialog id={id} className="modal">
        <div className="modal-box bg-gray-900">
          <p>{confirmInfo?.message}</p>
          <div className="modal-action">
            <button
              tabIndex={1}
              type="button"
              className="btn"
              onClick={() => {
                handleDialog("close");
              }}
            >
              취소
            </button>
            <button
              tabIndex={2}
              type="button"
              className="btn"
              onClick={() => {
                confirmInfo?.callback();
                handleDialog("close");
              }}
            >
              확인
            </button>
          </div>
        </div>
      </dialog>
    </ConfirmContext.Provider>
  );
}
