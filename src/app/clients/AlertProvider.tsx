"use client";

import { createContext, ReactNode, useState } from "react";

type AlertInfo = {
  type: "info" | "success" | "warning" | "error";
  message: string;
};

export const AlertContext = createContext<{
  showAlert: (alertInfo: AlertInfo) => void;
}>({ showAlert: () => {} });

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [alertInfo, setAlertInfo] = useState<AlertInfo>();
  const renderAlert = () => {
    if (alertInfo) {
      let icon: JSX.Element | null = null;

      switch (alertInfo.type) {
        case "error": {
          icon = (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
          break;
        }
        case "info": {
          icon = (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          );
          break;
        }
        case "success": {
          icon = (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
          break;
        }
        case "warning": {
          icon = (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          );
          break;
        }
      }

      return (
        <div className="fixed top-0 p-4 w-full animate-alert">
          <div className="hidden alert-success"></div>
          <div className="hidden alert-info"></div>
          <div className="hidden alert-warning"></div>
          <div className="hidden alert-error"></div>
          <div role="alert" className={`alert alert-${alertInfo.type}`}>
            {icon}
            <span>{alertInfo.message}</span>
          </div>
        </div>
      );
    }
  };

  const showAlert = (alertInfo: AlertInfo) => {
    setAlertInfo(alertInfo);

    setTimeout(() => {
      setAlertInfo(undefined);
    }, 3000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {renderAlert()}
    </AlertContext.Provider>
  );
}
