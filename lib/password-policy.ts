/**
 * Password rules shared by the server (validation) and the client (form hints).
 *
 * Deliberately in its own module with no Node imports. It used to live in
 * `lib/password.ts`, but a Client Component importing this one constant pulled
 * that whole file — and `node:crypto` with it — into the browser bundle, where
 * `promisify(scrypt)` throws "The 'original' argument must be of type Function"
 * at module evaluation.
 */
export const MIN_PASSWORD_LENGTH = 8;
