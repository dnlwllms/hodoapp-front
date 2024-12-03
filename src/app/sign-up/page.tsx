'use client';

import { ChangeEvent, FormEvent, Fragment, useState } from 'react';

import { useRouter } from 'next/navigation';
import HttpRequest from '@/network/HttpRequest';
import Link from 'next/link';

export default function Page() {
  const [email, setEmail] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { push } = useRouter();

  const handleEmailChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setEmail(value);
  };

  const handleNicknameChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setNickname(value);
  };

  const handlePasswordChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setPassword(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await HttpRequest.set('POST', '/users', {
        email,
        nickname,
        password,
      });

      await HttpRequest.set('POST', '/auth', {
        email,
        password,
      });

      push('/line');
    } catch (e) {
      alert(e);
    }
  };

  return (
    <Fragment>
      <div className="sticky top-0 left-0 navbar bg-base-100">
        <div className="navbar-start">
          <Link href="/login">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <svg width={24} height={24}>
                <use href="/icons/outlined/arrows.svg#Outlined/Arrows/left" />
              </svg>
            </div>
          </Link>
        </div>
        <div className="navbar-center">Join</div>
        <div className="navbar-end"></div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 p-4">
          <label className="input input-bordered flex items-center gap-2">
            <svg width={16} height={16}>
              <use href="/icons/outlined/base.svg#Outlined/Base/mail" />
            </svg>
            <input
              type="email"
              className="grow"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <svg width={16} height={16}>
              <use href="/icons/outlined/peoples.svg#Outlined/Peoples/people" />
            </svg>
            <input
              type="text"
              className="grow"
              placeholder="Nickname"
              value={nickname}
              onChange={handleNicknameChange}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            <svg width={16} height={16}>
              <use href="/icons/outlined/base.svg#Outlined/Base/key" />
            </svg>
            <input
              type="password"
              className="grow"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
          </label>
          <button type="submit" className="btn">
            Submit
          </button>
        </div>
      </form>
    </Fragment>
  );
}
