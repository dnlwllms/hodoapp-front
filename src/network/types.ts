export type CommonResponse<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

export type PaginationResponse<T> = {
  list: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
};

export type CommonDtoResponse = {
  id: number;

  createdAt: string;

  updatedAt: string;

  deletedAt: string | null;
};

export type Line = CommonDtoResponse & {
  price: number;
  description: string;
  date: string;
  creator: {
    id: string;
    nickname: string;
  };
};

export type GetLineRequestParams = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
};

export type PostLineRequestParams = {
  date: string;
  description: string;
  price: number;
};

export type PutLineRequestParams = Partial<PostLineRequestParams>;

export type GetAuthResponseParams = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  email: string;
  nickname: string;
};

export type PostAuthResponseParams = {
  accessToken: string;
};

export type PostAuthRequestParams = {
  email: string;
  password: string;
};
