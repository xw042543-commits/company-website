export type AppErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'rate-limited'
  | 'unavailable'
  | 'unexpected';

export interface AppError {
  readonly kind: AppErrorKind;
  readonly code: string;
}

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AppError };
