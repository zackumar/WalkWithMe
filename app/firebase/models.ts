import type { JWTPayload } from 'jose';

export interface User {
  /**
   * Whether the email has been verified
   */
  readonly emailVerified: boolean;

  /**
   * Whether the user is authenticated using the ANONYMOUS provider.
   */
  readonly isAnonymous: boolean;

  readonly displayName: string | null;

  /**
   * The email of the user.
   */
  readonly email: string | null;

  /**
   * The phone number normalized based on the E.164 standard (e.g. +16505550101) for the
   * user.
   *
   * @remarks
   * This is null if the user has no phone credential linked to the account.
   */
  readonly phoneNumber: string | null;

  /**
   * The profile photo URL of the user.
   */
  readonly photoURL: string | null;

  /**
   * The provider used to authenticate the user.
   */
  readonly providerId: string;

  /**
   * The user's unique ID, scoped to the project.
   */
  readonly localId: string;
}

export interface DecodedIdToken extends JWTPayload {
  readonly idToken: string;
  readonly email: string;
  readonly refreshToken: string;
  readonly expiresIn: string;
  readonly localId: string;
  readonly registered: boolean;
}
