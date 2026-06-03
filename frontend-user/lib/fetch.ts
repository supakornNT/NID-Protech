const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FetchJsonInit = RequestInit & {
  skipSessionExpiredEvent?: boolean;
};

export async function fetchJson<T>(
  path: string,
  options?: FetchJsonInit,
): Promise<T> {
  const { skipSessionExpiredEvent = false, ...requestInit } = options ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...requestInit,
  });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (
      res.status === 401 &&
      !skipSessionExpiredEvent &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new CustomEvent("session:expired"));
    }

    throw new Error(
      typeof body?.message === "string" ? body.message : `HTTP ${res.status}`,
    );
  }

  return body as T;
}
