import HttpRequest from "./HttpRequest";

import {
  PostAuthResponseParams,
  GetLineRequestParams,
  Line,
  PaginationResponse,
  PostAuthRequestParams,
  PostLineRequestParams,
  GetAuthResponseParams,
  PutLineRequestParams,
  GetLinesTotalPriceSummaryResponseParams,
  GetLinesTotalPriceSummaryRequestParams,
  GetDailyPriceSummaryRequestParams,
  GetDailyPriceSummaryResponseParams,
} from "./types";

export enum QueryKey {
  GetAuth,
  GetLine,
  GetLines,
  GetLinesTotalPriceSummary,
  GetLinesDailyPriceSummary,
}

export enum MutationKey {
  PostAuth,
  PostLine,
  PutLine,
  DeleteLine,
}

export async function getAuth() {
  const res = await HttpRequest.get<GetAuthResponseParams>(`/auth`);

  return res;
}

export async function postAuth(params: PostAuthRequestParams) {
  const res = await HttpRequest.set<PostAuthResponseParams, typeof params>(
    "POST",
    `/auth`,
    params
  );

  return res;
}

export async function getLine(id: number) {
  return await HttpRequest.get<Line>(`/lines/${id}`);
}

export async function getLines(params?: GetLineRequestParams) {
  return await HttpRequest.get<PaginationResponse<Line>, typeof params>(
    `/lines`,
    params
  );
}

export async function postLines(params: PostLineRequestParams) {
  return await HttpRequest.set<Line, typeof params>("POST", `/lines`, params);
}

export async function putLines({ id, ...params }: PutLineRequestParams) {
  return await HttpRequest.set<Line, typeof params>(
    "PUT",
    `/lines/${id}`,
    params
  );
}

export async function deleteLines(id: number) {
  return await HttpRequest.set<Line>("DELETE", `/lines/${id}`);
}

export async function getLinesTotalPriceSummary(
  params: GetLinesTotalPriceSummaryRequestParams
) {
  return await HttpRequest.get<
    GetLinesTotalPriceSummaryResponseParams,
    typeof params
  >("/lines/total-price/summary", params);
}

export async function getLinesDailyPriceSummary(
  params: GetDailyPriceSummaryRequestParams
) {
  return await HttpRequest.get<
    GetDailyPriceSummaryResponseParams,
    typeof params
  >("/lines/daily-price/summary", params);
}

export async function postAWSUpload(formData: FormData) {
  const {
    data: { key, url },
  } = await HttpRequest.upload(formData);

  return {
    key,
    url,
  };
}
