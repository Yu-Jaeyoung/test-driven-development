import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidCommandException extends HttpException {
  constructor() {
    super("Bad Request", HttpStatus.BAD_REQUEST);
  }
}