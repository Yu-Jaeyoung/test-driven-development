import { v4 as uuid } from "uuid";

export class EmailGenerator {
  static generateEmail(): string {
    return uuid() + "@test.com";
  }
}