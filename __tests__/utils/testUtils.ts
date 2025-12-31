import type { DisplayPostData, InsertPostData, PostData } from '../../@types/PostData';

/**
 * Create a mock DisplayPostData object with default values
 */
export function createMockDisplayPost(overrides?: Partial<DisplayPostData>): DisplayPostData {
  return {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Post',
    url: 'https://example.com/test',
    category: 'tech',
    added_at: new Date('2024-01-01T00:00:00.000Z'),
    description: 'Test description',
    comment: 'Test comment',
    image: 'https://example.com/image.jpg',
    tag: ['test', 'example'],
    ...overrides,
  };
}

/**
 * Create a mock InsertPostData object with default values
 */
export function createMockInsertPost(overrides?: Partial<InsertPostData>): InsertPostData {
  return {
    title: 'Test Post',
    url: 'https://example.com/test',
    category: 'tech',
    added_at: new Date('2024-01-01T00:00:00.000Z'),
    description: 'Test description',
    comment: 'Test comment',
    image: 'https://example.com/image.jpg',
    tag: ['test', 'example'],
    ...overrides,
  };
}

/**
 * Create a mock PostData object with default values
 */
export function createMockPost(overrides?: Partial<PostData>): PostData {
  return {
    title: 'Test Post',
    url: 'https://example.com/test',
    category: 'tech',
    description: 'Test description',
    comment: 'Test comment',
    image: 'https://example.com/image.jpg',
    tag: ['test', 'example'],
    ...overrides,
  };
}

/**
 * Create multiple mock posts at once
 */
export function createMockDisplayPosts(
  count: number,
  baseOverrides?: Partial<DisplayPostData>
): DisplayPostData[] {
  return Array.from({ length: count }, (_, index) =>
    createMockDisplayPost({
      ...baseOverrides,
      _id: `507f1f77bcf86cd79943${index.toString().padStart(4, '0')}`,
      title: `${baseOverrides?.title || 'Test Post'} ${index + 1}`,
      url: `${baseOverrides?.url || 'https://example.com/test'}-${index + 1}`,
    })
  );
}

/**
 * Create a date relative to now
 */
export function createRelativeDate(daysAgo: number, hoursAgo = 0, minutesAgo = 0): Date {
  const now = new Date();
  const milliseconds =
    daysAgo * 24 * 60 * 60 * 1000 + hoursAgo * 60 * 60 * 1000 + minutesAgo * 60 * 1000;
  return new Date(now.getTime() - milliseconds);
}

/**
 * Wait for a specific amount of time (useful for time-based tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a time difference is approximately equal to expected (within tolerance)
 */
export function isApproximatelyEqual(
  actual: number,
  expected: number,
  toleranceMs = 1000
): boolean {
  return Math.abs(actual - expected) <= toleranceMs;
}

/**
 * Create test categories
 */
export function createTestCategories(): string[] {
  return ['tech', 'news', 'sports', 'entertainment', 'business', 'science', 'health'];
}

/**
 * Create test tags
 */
export function createTestTags(): string[] {
  return ['javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'python', 'go'];
}

/**
 * Generate a unique test URL to avoid conflicts
 */
export function createUniqueTestUrl(base = 'https://example.com/test'): string {
  return `${base}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a unique domain name for testing
 */
export function createUniqueDomain(prefix = 'test'): string {
  return `${prefix}-${Date.now()}.example.com`;
}
