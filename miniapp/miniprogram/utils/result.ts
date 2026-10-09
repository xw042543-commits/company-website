export type AppErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'rate-limited'
  | 'unavailable'
  | 'unexpected';

export interface SafeAppError {
  readonly kind: AppErrorKind;
  readonly code: string;
  readonly details?: never;
}

export interface CommunityRestrictionDetails {
  readonly restrictionKind: 'MUTE' | 'BAN';
  readonly endsAt: string | null;
}
export interface CommunityRestrictionError {
  readonly kind: 'forbidden';
  readonly code: 'COMMUNITY_USER_RESTRICTED';
  readonly details: CommunityRestrictionDetails;
}
export type AppError = SafeAppError | CommunityRestrictionError;

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AppError };
