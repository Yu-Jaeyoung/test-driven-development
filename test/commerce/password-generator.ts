import { v4 as uuid } from "uuid";

export class PasswordGenerator {
  static generatePassword() {
    return "password" + uuid();
  }
}