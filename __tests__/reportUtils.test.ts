import {
  clampComment,
  countCommentChars,
  MAX_COMMENT_CHARS,
  remainingCommentChars,
  roundCoordinate,
} from '@/src/features/reports/reportUtils';

describe('reportUtils', () => {
  test('countCommentChars counts emoji as 1', () => {
    expect(countCommentChars('a')).toBe(1);
    expect(countCommentChars('👍')).toBe(1);
    expect(countCommentChars('a👍b')).toBe(3);
  });

  test('clampComment limits by codepoints', () => {
    const longText = 'a'.repeat(MAX_COMMENT_CHARS + 2);
    const clamped = clampComment(longText);
    expect(clamped.length).toBe(MAX_COMMENT_CHARS);

    const emojiText = '👍'.repeat(MAX_COMMENT_CHARS + 1);
    const emojiClamped = clampComment(emojiText);
    expect(countCommentChars(emojiClamped)).toBe(MAX_COMMENT_CHARS);
  });

  test('remainingCommentChars never negative', () => {
    expect(remainingCommentChars('')).toBe(MAX_COMMENT_CHARS);
    expect(remainingCommentChars('a'.repeat(10))).toBe(MAX_COMMENT_CHARS - 10);
    expect(remainingCommentChars('a'.repeat(MAX_COMMENT_CHARS + 1))).toBe(0);
  });

  test('roundCoordinate rounds to 5 decimals', () => {
    expect(roundCoordinate(35.689567)).toBe(35.68957);
    expect(roundCoordinate(139.691745)).toBe(139.69175);
    expect(roundCoordinate(null)).toBeNull();
  });
});
