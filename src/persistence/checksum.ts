/**
 * Computes a deterministic SHA-256 hex checksum for a given object or string.
 */
export async function computeChecksum(data: unknown): Promise<string> {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(sortKeys(data));
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(jsonStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyChecksum(data: unknown, expectedChecksum: string): Promise<boolean> {
  const actual = await computeChecksum(data);
  return actual.toLowerCase() === expectedChecksum.toLowerCase();
}

/**
 * Recursively sort object keys for deterministic serialization.
 */
function sortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  const sorted: Record<string, any> = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = sortKeys(obj[key]);
    });
  return sorted;
}
