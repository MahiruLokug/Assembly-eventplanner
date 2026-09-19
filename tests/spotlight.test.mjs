import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextUpcomingEvent } from '../lib/spotlight.ts';
const now = Date.parse('2026-09-19T12:00:00+05:30');
const event = (id, starts, status = 'published') => ({id, starts, status});
const past = event('past', '2026-09-18T12:00:00+05:30');
const first = event('first', '2026-09-20T09:00:00+05:30');
const later = event('later', '2026-09-21T09:00:00+05:30');
test('selects nearest published future event regardless of array order', () => {
  const events = [later, past, event('cancelled','2026-09-19T13:00:00+05:30','cancelled'), event('draft','2026-09-19T13:00:00+05:30','draft'), first];
  assert.equal(nextUpcomingEvent(events, now), first);
  assert.equal(events[0], later);
});
test('switches at the exact start instant and returns null when none remain', () => {
  assert.equal(nextUpcomingEvent([first, later], Date.parse(first.starts)), later);
  assert.equal(nextUpcomingEvent([first, later], Date.parse(later.starts)), null);
  assert.equal(nextUpcomingEvent([], now), null);
});
test('compares timezone offsets as instants and ignores invalid dates', () => {
  const nearer = event('nearer', '2026-09-19T07:00:00Z');
  assert.equal(nextUpcomingEvent([first, event('invalid','bad'), nearer], now), nearer);
});
test('breaks simultaneous starts consistently', () => {
  const a = event('a',first.starts), b = event('b',first.starts);
  assert.equal(nextUpcomingEvent([b,a],now),a);
  assert.equal(nextUpcomingEvent([a,b],now),a);
});
