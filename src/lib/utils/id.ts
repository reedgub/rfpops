import { randomUUID } from "node:crypto";

export function createId(prefix: string) {
  void prefix;
  return randomUUID();
}
