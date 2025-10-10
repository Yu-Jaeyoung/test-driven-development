export const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

export function isEmailValid(email: string | undefined): boolean {
  return email !== undefined && EMAIL_REGEX.test(email);
}