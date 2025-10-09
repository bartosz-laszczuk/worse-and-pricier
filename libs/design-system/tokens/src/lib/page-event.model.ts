/**
 * Pagination event emitted when page changes
 */
export interface PageEvent {
  length: number;
  pageIndex: number;
  pageSize: number;
}
