import queryString from "query-string";

import { CommonResponse } from "./types";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";

type Header = HeadersInit & { Authorization?: string };

export default class HttpRequest {
  static token = "";

  private static baseUrl = process.env.NEXT_PUBLIC_API_URL;

  private static credentials = "include" as const;

  static defaultHeaders: Header = {
    "Content-Type": "application/json; charset=UTF-8",
  };

  private static async responseToJson<Res = unknown>(response: Response) {
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message);
    }

    return json as CommonResponse<Res>;
  }

  static async get<Res = unknown, Req = unknown>(
    uri: string,
    bodyData?: Req,
    headerData?: Header
  ) {
    let url = this.baseUrl + uri;

    if (typeof document !== "undefined") {
      const accessToken = parseCookie(document.cookie).get("accessToken");

      if (accessToken) {
        this.defaultHeaders.Authorization = `Bearer ${accessToken}`;
      }
    }

    url += `?${queryString.stringify(bodyData as queryString.ParsedQuery)}`;

    if (headerData?.Authorization) {
      this.defaultHeaders.Authorization = headerData.Authorization;
    }

    const response = await fetch(url, {
      method: "GET",
      credentials: this.credentials,
      headers: {
        ...this.defaultHeaders,
        ...headerData,
      },
    });

    return await this.responseToJson<Res>(response);
  }

  static async set<Res = unknown, Req = unknown>(
    method: "POST" | "PUT" | "DELETE",
    uri: string,
    bodyData?: Req,
    headerData?: Header
  ) {
    const response = await fetch(this.baseUrl + uri, {
      method,
      credentials: this.credentials,
      headers: {
        ...this.defaultHeaders,
        ...headerData,
      },
      body: JSON.stringify(bodyData),
    });

    return await this.responseToJson<Res>(response);
  }
}
