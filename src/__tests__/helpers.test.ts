import { 
  formatDate, 
  formatDateTime, 
  formatRelativeTime, 
  isOverdue, 
  getInitials, 
  cn 
} from '../utils/helpers';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Dec 25, 2023/);
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/Dec 25, 2023/);
      expect(formatted).toMatch(/10:30/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Just now" for very recent dates', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(formatRelativeTime(recent)).toBe('Just now');
    });

    it('should return minutes for recent dates', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      expect(formatRelativeTime(recent)).toBe('5m ago');
    });

    it('should return hours for dates within 24 hours', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(formatRelativeTime(recent)).toBe('3h ago');
    });

    it('should return days for dates within a week', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      expect(formatRelativeTime(recent)).toBe('3d ago');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2030-01-01');
      expect(isOverdue(futureDate)).toBe(false);
    });
  });

  describe('getInitials', () => {
    it('should return initials for single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should return initials for full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return first two initials for multiple names', () => {
      expect(getInitials('John Michael Doe Smith')).toBe('JM');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('');
    });
  });

  describe('cn (className utility)', () => {
    it('should combine class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', false, null, undefined, 'class2')).toBe('class1 class2');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });
  });
});
