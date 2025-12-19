import { randomInt } from "crypto";

export class PasswordGenerator {
  private readonly rng: (
    min: number,
    maxExclusive: number,
  ) => number;

  constructor(rng?: (
    min: number,
    maxExclusive: number,
  ) => number) {
    this.rng = rng ?? ((
      min,
      max,
    ) => randomInt(min, max));
  }

  generatePassword(prefix = "password"): string {
    const parts: string[] = [];
    for (let i = 0; i < 10; i++) {
      parts.push(String.fromCharCode(this.rng(65, 91)));
      parts.push(String.fromCharCode(this.rng(48, 58)));
      parts.push(String.fromCharCode(this.rng(97, 123)));
    }
    return `${ prefix }${ parts.join("") }`;
  }

  static generatePassword(prefix = "password"): string {
    return new PasswordGenerator().generatePassword(prefix);
  }
}
