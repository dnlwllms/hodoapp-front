import { SelectHTMLAttributes } from "react";

export default function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const classList = ["select"];

  if (className) {
    classList.push(className);
  }

  return <select className={classList.join(" ")} {...props} />;
}
