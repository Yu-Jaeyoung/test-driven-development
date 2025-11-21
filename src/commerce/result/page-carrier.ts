export interface PageCarrier<T> {
  items: T[];
  continuationToken: string | undefined;
}