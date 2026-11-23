/**
 * Sanitizes error messages so raw SQL, Postgres internals, table names,
 * or stack traces are never exposed to clients.
 */
export function sanitizeErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string {
  if (!err) return fallback;
  const raw = err instanceof Error ? err.message : String(err);

  // Preserve authorized and validation messages
  if (
    raw.startsWith("Unauthorized:") ||
    raw.startsWith("Validation Error:") ||
    raw.startsWith("Database Conflict:") ||
    raw.startsWith("Database Error:") ||
    raw.startsWith("Base64 image blobs are strictly prohibited")
  ) {
    return raw;
  }

  // Detect common PostgreSQL constraint errors
  if (raw.includes("duplicate key value") || raw.includes("unique constraint")) {
    return "A record with this unique identifier or slug already exists. Please customize your inputs.";
  }
  if (raw.includes("violates foreign key constraint")) {
    return "The referenced entity does not exist or has been removed.";
  }
  if (raw.includes("violates check constraint")) {
    return "The provided data violates a business validation rule.";
  }

  // In production, mask raw server or database details
  if (process.env.NODE_ENV === "production") {
    return fallback;
  }

  return raw;
}

