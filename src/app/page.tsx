"use client";

import Image from "next/image";

import { useState } from "react";

import { postAWSUpload } from "@/network/api";
import HttpRequest from "@/network/HttpRequest";

export default function Home() {
  const [key, setKey] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div className="w-auto h-auto">
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            const formData = new FormData();

            formData.append("file", e.target.files[0]);

            postAWSUpload(formData).then(({ key, url }) => {
              setKey(key);
              setUrl(url);
            });
          }
        }}
      />
      {url && (
        <Image
          className="w-auto h-auto"
          src={url}
          alt=""
          width={100}
          height={30}
          priority
        />
      )}
      {key && (
        <button
          onClick={async () => {
            await HttpRequest.delete(key);

            setKey("");
            setUrl("");
          }}
        >
          삭제
        </button>
      )}
    </div>
  );
}
