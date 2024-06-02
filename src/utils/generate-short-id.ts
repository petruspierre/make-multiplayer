import { customAlphabet } from "nanoid";

export function generateShortId() {
  const nanoid = customAlphabet('1234567890abcdef', 6);
  return nanoid().toUpperCase();
}