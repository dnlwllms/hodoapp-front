"use client";

import { ChangeEvent, FormEvent, useContext, useState } from "react";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { MutationKey, postAuth, QueryKey } from "@/network/api";
import getQueryClient from "@/network/getQueryClient";
import { AlertContext } from "@/app/clients/AlertProvider";

export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { showAlert } = useContext(AlertContext);

  const { push } = useRouter();

  const { mutateAsync } = useMutation({
    mutationKey: [MutationKey.PostAuth],
    mutationFn: postAuth,
  });

  const handleEmailChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setEmail(value);
  };

  const handlePasswordChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setPassword(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await mutateAsync({
        email,
        password,
      });

      const qc = getQueryClient();

      await qc.invalidateQueries({
        queryKey: [QueryKey.GetAuth],
      });

      push("/line");
    } catch (e) {
      showAlert({
        type: "error",
        message: String(e),
      });
    }
  };

  return (
    <form
      className="flex h-full flex-col justify-center"
      autoComplete="on"
      onSubmit={handleSubmit}
    >
      <div className="flex w-full flex-col gap-4 p-4">
        <label className="input input-bordered flex items-center gap-2">
          <svg width={16} height={16}>
            <use href="/icons/outlined/base.svg#Outlined/Base/mail" />
          </svg>
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="on"
            className="grow"
            value={email}
            onChange={handleEmailChange}
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <svg width={16} height={16}>
            <use href="/icons/outlined/base.svg#Outlined/Base/key" />
          </svg>
          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="on"
            className="grow"
            value={password}
            onChange={handlePasswordChange}
          />
        </label>
        <button type="submit" className="btn" disabled={!email || !password}>
          로그인
        </button>
      </div>
    </form>
  );
}
