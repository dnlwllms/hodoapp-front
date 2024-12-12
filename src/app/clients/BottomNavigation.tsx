"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { UserContext } from "./UserProvider";

export default function BottomNavigation() {
  const pathname = usePathname();

  const user = useContext(UserContext);

  if (!user) {
    return null;
  }

  return (
    <nav className="fixed h-[58px] bottom-0 w-full bg-gray-1000">
      <ul className="flex w-full h-full flex-1">
        {[
          {
            key: 1,
            href: "/line",
            title: "정산",
            icon: "/icons/outlined/books.svg#Outlined/Books/notebook-and-pen",
          },
          {
            key: 2,
            href: "/food",
            title: "식단",
            icon: "/icons/filled/foods.svg#Filled/Foods/fork-spoon",
          },
        ].map(({ key, href, icon, title }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className={
                "flex-1" + (isActive ? " text-gray-100" : " text-gray-500")
              }
              scroll={false}
            >
              <li className="flex justify-center items-center flex-col py-[6px] text-[14px]">
                <button>
                  <svg width={24} height={24}>
                    <use href={icon} />
                  </svg>
                </button>
                <span>{title}</span>
              </li>
            </Link>
          );
        })}
      </ul>
    </nav>
  );
}
