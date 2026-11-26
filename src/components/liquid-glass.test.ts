import { describe, expect, it } from 'vitest';
import { displacementPixels } from './LiquidGlass';

const at = (px: Uint8ClampedArray, w: number, x: number, y: number) => {
  const i = (y * w + x) * 4;
  return { r: px[i], g: px[i + 1] };
};

describe('liquid glass displacement map', () => {
  const W = 200;
  const H = 60;
  const px = displacementPixels(W, H, 30, 16);

  it('leaves the flat centre neutral', () => {
    expect(at(px, W, 100, 30)).toEqual({ r: 128, g: 128 });
  });
  it('points inward near every edge of the pill', () => {
    expect(at(px, W, 100, 1).g).toBeGreaterThan(200); // top edge → down
    expect(at(px, W, 100, H - 2).g).toBeLessThan(60); // bottom edge → up
    expect(at(px, W, 1, 30).r).toBeGreaterThan(200); // left cap → right
    expect(at(px, W, W - 2, 30).r).toBeLessThan(60); // right cap → left
    // on the long straight edge the pull is purely vertical
    expect(Math.abs(at(px, W, 100, 1).r - 128)).toBeLessThan(2);
  });
  it('is strongest at the edge and fades towards the bezel depth', () => {
    expect(at(px, W, 100, 1).g).toBeGreaterThan(at(px, W, 100, 10).g);
    expect(at(px, W, 100, 20).g).toBe(128);
  });
});
