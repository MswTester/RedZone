import { ZodType } from 'zod';

export function encodeToBuffer<T>(schema: ZodType<T>, data: T): ArrayBuffer {
  schema.parse(data);
  const json = JSON.stringify(data);
  return new TextEncoder().encode(json).buffer;
}

export function decodeFromBuffer<T>(schema: ZodType<T>, buffer: ArrayBuffer): T {
  const json = new TextDecoder().decode(new Uint8Array(buffer));
  const obj = JSON.parse(json);
  return schema.parse(obj);
}

export function unsafeEncode(data: any): ArrayBuffer {
  return new TextEncoder().encode(JSON.stringify(data)).buffer;
}

export function unsafeDecode<T = any>(buffer: ArrayBuffer): T {
  return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer))) as T;
}
