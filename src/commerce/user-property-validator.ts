export const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
export const USER_NAME_REGEX: RegExp = /^[a-zA-Z0-9_-]{3,}$/;

export function isEmailValid(email: string | undefined): boolean {
  return email !== undefined && EMAIL_REGEX.test(email);
}

export function isUsernameValid(username: string | undefined): boolean {
  return username !== undefined && USER_NAME_REGEX.test(username);
}

export function isPasswordValid(password: string | undefined): boolean {
  return password !== undefined && password.length >= 8;
}