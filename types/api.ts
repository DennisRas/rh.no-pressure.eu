export type RequestOptions = {
  headers?: Record<string, string>;
  auth?: boolean;
  onRateLimited?: (info: { path: string; waitMs: number; attempt: number }) => void;
};

export type GetEventsOptions = Pick<RequestOptions, "onRateLimited"> & {
  onPage?: (info: { page: number; pages: number; fetched: number }) => void;
};
