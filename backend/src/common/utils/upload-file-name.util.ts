export function normalizeUploadedFileName(name: string): string {
  if (!name) {
    return name;
  }

  const normalized = name.normalize("NFC").trim();

  try {
    const decoded = Buffer.from(normalized, "latin1").toString("utf8").trim();

    if (looksBetterThanOriginal(normalized, decoded)) {
      return decoded;
    }
  } catch {
    // Ignore decoding failures and keep the original name.
  }

  return normalized;
}

function looksBetterThanOriginal(original: string, candidate: string): boolean {
  if (!candidate || candidate.includes("\uFFFD")) {
    return false;
  }

  const originalThaiCount = countThaiChars(original);
  const candidateThaiCount = countThaiChars(candidate);

  if (candidateThaiCount > originalThaiCount) {
    return true;
  }

  return hasMojibakePattern(original) && !hasMojibakePattern(candidate);
}

function countThaiChars(value: string): number {
  return (value.match(/[\u0E00-\u0E7F]/g) ?? []).length;
}

function hasMojibakePattern(value: string): boolean {
  return /(?:Ã|Â|à¸|à¹|เธ|เน€)/u.test(value);
}
