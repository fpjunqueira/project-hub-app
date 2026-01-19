export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort?: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}
