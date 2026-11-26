import { describe, expect, it } from 'vitest';
import { holeState, stickPose, wakeHole, wakePose } from './ThemeToggle';

describe('theme toggle stickman', () => {
  it('appears, walks toward the hole, jumps and then sinks out of sight', () => {
    const start = stickPose(0.31);
    const walking = stickPose(1.0);
    const jump = stickPose(1.55);
    const falling = stickPose(1.95);
    expect(start.visible).toBe(true);
    expect(walking.x).toBeGreaterThan(start.x);
    expect(jump.y).toBeLessThan(walking.y); // in the air
    expect(jump.arm).toBeGreaterThan(1.5); // arms raised
    expect(falling.sink).toBeGreaterThan(0);
    expect(stickPose(2.2).visible).toBe(false);
  });

  it('darkens and widens the hole while he falls, then closes it again', () => {
    expect(holeState(1.0).dark).toBe(0);
    expect(holeState(2.0).dark).toBeGreaterThan(0.9);
    expect(holeState(2.0).rx).toBeGreaterThan(holeState(1.0).rx);
    expect(holeState(3.0).dark).toBe(0);
  });
});

describe('theme toggle stickman — waking the light (dark → light)', () => {
  it('leaps out of the hole, walks left to the knob and reaches for it', () => {
    const leap = wakePose(0.25);
    const landed = wakePose(0.55);
    const walking = wakePose(1.2);
    const reach = wakePose(1.95);
    expect(leap.y).toBeLessThan(70); // in the air above the ground line
    expect(walking.x).toBeLessThan(landed.x); // walking left
    expect(reach.x).toBe(92);
    expect(reach.arm).toBeGreaterThan(1.2); // arm raised to the switch
    expect(wakePose(2.4).visible).toBe(false);
  });

  it('keeps the hole dark until the light comes on, then turns it light', () => {
    expect(wakeHole(1.0).dark).toBe(1);
    expect(wakeHole(2.6).dark).toBe(0);
  });
});
