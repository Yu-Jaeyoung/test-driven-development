import { v4 as uuid } from "uuid";

export class UsernameGenerator {
  static generateUsername() {
    return "username" + uuid();
  }
}