import { describe, expect, it } from 'vitest';
import * as single from '../../[code]/route';
import * as doubled from './route';

describe('wedding.co.tz/g/g/<code>', () => {
  it('opens the same tracked link as /g/<code>, for buttons sent with the prefix twice', () => {
    expect(doubled.GET).toBe(single.GET);
    expect(doubled.dynamic).toBe('force-dynamic');
  });
});
