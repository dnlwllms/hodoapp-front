"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function Page() {
  const [socket, setSocket] = useState<Socket>();

  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/company`);

    socket.on("front", (...message) => {
      console.log(message);
      switch (message[0]) {
        case "checkin-success": {
          setCheckInTime(message[1]);
          break;
        }
        case "checkout-success": {
          setCheckOutTime(message[1]);
          break;
        }
      }
    });

    setSocket(socket);

    return () => {
      socket.close();
    };
  }, []);

  const [date, setDate] = useState<Date>();

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleCheckIn = () => {
    const isOk = confirm("출근 하시겠습니까?");
    if (isOk) {
      socket?.send("checkin", "");
    }
  };
  const handleCheckOut = () => {
    const isOk = confirm("퇴근 하시겠습니까?");
    if (isOk) {
      socket?.send("checkout", "");
    }
  };

  return (
    <div className="h-[100dvh] gap-4 p-4 flex flex-col">
      <div className="text-3xl text-center">
        {date ? format(date, "HH:mm:ss") : ""}
      </div>
      <div>
        {checkInTime
          ? `Check-in Time: ${new Date(checkInTime).toLocaleString("ko-KR")}`
          : "Before Check-in"}
      </div>
      <div>
        {checkOutTime
          ? `Check-out Time: ${new Date(checkOutTime).toLocaleString("ko-KR")}`
          : "Before Check-out"}
      </div>
      <div className="flex gap-4 mt-auto mb-[80px]">
        <button
          className="flex-1 btn btn-primary bg-blue-500"
          onClick={handleCheckIn}
          disabled={!!checkInTime}
        >
          출근
        </button>
        <button className="flex-1 btn btn-error bg-red-500" onClick={handleCheckOut}>
          퇴근
        </button>
      </div>
    </div>
  );
}
