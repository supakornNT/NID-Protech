const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

type JsonValue =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

type FetchJsonInit = RequestInit & {
  skipSessionExpiredEvent?: boolean;
};

function resolveApiUrl(endpoint: string) {
  if (/^https?:\/\//.test(endpoint)) {
    return endpoint;
  }

  return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}

export async function fetchJson<T = JsonValue>(
  endpoint: string,
  init?: FetchJsonInit,
): Promise<T> {
  const { skipSessionExpiredEvent = false, ...requestInit } = init ?? {};

  const response = await fetch(resolveApiUrl(endpoint), {
    credentials: "include",
    ...requestInit,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401) {
      if (!skipSessionExpiredEvent && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("session:expired"));
      }

      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message: unknown }).message)
          : "Session หมดอายุแล้ว";

      throw new Error(message);
    }

    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : "Request failed";

    throw new Error(message);
  }

  return data as T;
}
