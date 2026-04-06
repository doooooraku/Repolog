jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///var/mobile/Containers/Data/Application/NEW-UUID/Documents/',
}));

import { toRelativePath, toAbsolutePath } from '@/src/db/photoPathUtils';

describe('photoPathUtils', () => {
  describe('toRelativePath', () => {
    test('converts iOS absolute path to relative', () => {
      const absolute =
        'file:///var/mobile/Containers/Data/Application/OLD-UUID/Documents/repolog/reports/r_abc/photos/123.jpg';
      expect(toRelativePath(absolute)).toBe('repolog/reports/r_abc/photos/123.jpg');
    });

    test('converts Android absolute path to relative', () => {
      const absolute =
        'file:///data/user/0/com.dooooraku.repolog/files/repolog/reports/r_abc/photos/123.jpg';
      expect(toRelativePath(absolute)).toBe('repolog/reports/r_abc/photos/123.jpg');
    });

    test('converts path starting with / to relative', () => {
      const absolute = '/data/user/0/com.dooooraku.repolog/files/repolog/reports/r_abc/photos/123.jpg';
      expect(toRelativePath(absolute)).toBe('repolog/reports/r_abc/photos/123.jpg');
    });

    test('returns already-relative path unchanged', () => {
      const relative = 'repolog/reports/r_abc/photos/123.jpg';
      expect(toRelativePath(relative)).toBe(relative);
    });

    test('returns unrecognized absolute path unchanged', () => {
      const unrecognized = 'file:///tmp/cache/ImagePicker/photo.jpg';
      expect(toRelativePath(unrecognized)).toBe(unrecognized);
    });

    test('leaves E2E seed paths unchanged', () => {
      const e2ePath = 'file:///var/mobile/.../caches/repolog/e2e/r_abc/seed-1.jpg';
      expect(toRelativePath(e2ePath)).toBe(e2ePath);
    });
  });

  describe('toAbsolutePath', () => {
    test('prepends documentDirectory to relative path', () => {
      const relative = 'repolog/reports/r_abc/photos/123.jpg';
      expect(toAbsolutePath(relative)).toBe(
        'file:///var/mobile/Containers/Data/Application/NEW-UUID/Documents/repolog/reports/r_abc/photos/123.jpg',
      );
    });

    test('returns file:// absolute path unchanged', () => {
      const absolute = 'file:///tmp/cache/photo.jpg';
      expect(toAbsolutePath(absolute)).toBe(absolute);
    });

    test('returns slash-prefixed absolute path unchanged', () => {
      const absolute = '/data/user/0/photo.jpg';
      expect(toAbsolutePath(absolute)).toBe(absolute);
    });
  });

  describe('round-trip', () => {
    test('toAbsolutePath(toRelativePath(abs)) resolves to current documentDirectory', () => {
      const oldAbsolute =
        'file:///var/mobile/Containers/Data/Application/OLD-UUID/Documents/repolog/reports/r_abc/photos/123.jpg';
      const result = toAbsolutePath(toRelativePath(oldAbsolute));
      expect(result).toBe(
        'file:///var/mobile/Containers/Data/Application/NEW-UUID/Documents/repolog/reports/r_abc/photos/123.jpg',
      );
    });
  });
});
