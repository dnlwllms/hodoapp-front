import HttpRequest from './HttpRequest';

import {
  PostAuthResponseParams,
  GetLineRequestParams,
  Line,
  PaginationResponse,
  PostAuthRequestParams,
  PostLineRequestParams,
  GetAuthResponseParams,
  PutLineRequestParams,
} from './types';

export enum QueryKey {
  GetAuth,
  GetLines,
}

export enum MutationKey {
  PostAuth,
  PostLine,
  DeleteLine,
}

export async function getAuth() {
  const res = await HttpRequest.get<GetAuthResponseParams>(`/auth`);

  return res;
}

export async function postAuth(params: PostAuthRequestParams) {
  const res = await HttpRequest.set<PostAuthResponseParams, typeof params>(
    'POST',
    `/auth`,
    params,
  );

  return res;
}

export async function getLines(params?: GetLineRequestParams) {
  return await HttpRequest.get<PaginationResponse<Line>, typeof params>(
    `/lines`,
    params,
  );
}

export async function postLines(params: PostLineRequestParams) {
  return await HttpRequest.set<Line, typeof params>('POST', `/lines`, params);
}

export async function putLines(params: PutLineRequestParams) {
  return await HttpRequest.set<Line, typeof params>('PUT', `/lines`, params);
}

export async function deleteLines(id: string) {
  return await HttpRequest.set<Line>('DELETE', `/lines/${id}`);
}
