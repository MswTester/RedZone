import { test, expect } from "bun:test";
import { parseTimeToMs, msToSeconds } from './time-utils';

test("parseTimeToMs converts time strings correctly", () => {
  expect(parseTimeToMs('15m')).toBe(15 * 60 * 1000); // 15 minutes in ms
  expect(parseTimeToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000); // 7 days in ms
  expect(parseTimeToMs('30s')).toBe(30 * 1000); // 30 seconds in ms
  expect(parseTimeToMs('2h')).toBe(2 * 60 * 60 * 1000); // 2 hours in ms
});

test("parseTimeToMs throws error for invalid format", () => {
  expect(() => parseTimeToMs('invalid')).toThrow('Invalid time format');
  expect(() => parseTimeToMs('15x')).toThrow('Invalid time format');
  expect(() => parseTimeToMs('abc')).toThrow('Invalid time format');
});

test("msToSeconds converts milliseconds to seconds", () => {
  expect(msToSeconds(15 * 60 * 1000)).toBe(15 * 60); // 15 minutes
  expect(msToSeconds(7 * 24 * 60 * 60 * 1000)).toBe(7 * 24 * 60 * 60); // 7 days
  expect(msToSeconds(30500)).toBe(30); // 30.5 seconds -> 30 (floor)
});