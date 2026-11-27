import { describe, expect, it } from 'vitest';
import { bulgePath, TAB_MOTIONS } from './TabBar';
import { resist } from './PullToRefresh';
import { blobAmount } from './SwipeRow';

describe('liquid bulge shape', () => {
  it('rises above the bar exactly at the active tab and keeps the bar rectangle', () => {
    const d = bulgePath(360, 60, 180, 40, 17);
    expect(d.startsWith('M0 ')).toBe(true);
    expect(d).toContain(' 180 2'); // peak at cx, y = BUMP - h
    expect(d.endsWith('Z')).toBe(true);
    expect(d).not.toMatch(/NaN|Infinity/);
  });

  it('clamps the bulge into the rounded corners at the bar edges', () => {
    const d = bulgePath(360, 60, 10, 60, 17);
    expect(d).not.toMatch(/L-|NaN/);
  });

  it('offers every style from both tab bar videos, with Liquid Bulge first', () => {
    expect(TAB_MOTIONS.map((m) => m.id)).toEqual(['pill', 'drop', 'bulge', 'notch', 'fill', 'label', 'bubble', 'string', 'glow', 'flip', 'particle', 'seesaw', 'slot']);
  });
});

describe('pull to refresh resistance', () => {
  it('ignores upward drags and slows down near the maximum', () => {
    expect(resist(-20)).toBe(0);
    expect(resist(60)).toBeGreaterThan(0);
    expect(resist(1000)).toBeLessThanOrEqual(120);
    expect(resist(200) - resist(100)).toBeLessThan(resist(100));
  });
});

describe('liquid delete blob', () => {
  it('grows with a left swipe and arms at 22% of the row width', () => {
    expect(blobAmount(10, 300)).toBe(0);
    expect(blobAmount(-33, 300)).toBeCloseTo(0.5, 1);
    expect(blobAmount(-66, 300)).toBe(1);
    expect(blobAmount(-400, 300)).toBe(1);
  });
});
