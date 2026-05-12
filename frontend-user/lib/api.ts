export function buildApiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
