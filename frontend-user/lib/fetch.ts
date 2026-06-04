const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const REQUEST_TIMEOUT_MS = 10_000;

type FetchJsonInit = RequestInit & {
  skipSessionExpiredEvent?: boolean;
};

export async function fetchJson<T>(
  path: string,
  options?: FetchJsonInit,
): Promise<T> {
  const { skipSessionExpiredEvent = false, signal: externalSignal, ...restInit } = options ?? {};

  // Only add internal timeout when the caller doesn't manage its own abort signal
  let signal: AbortSignal;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let timeoutController: AbortController | undefined;

  if (externalSignal) {
    signal = externalSignal;
  } else {
    timeoutController = new AbortController();
    timer = setTimeout(() => timeoutController!.abort(), REQUEST_TIMEOUT_MS);
    signal = timeoutController.signal;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      signal,
      ...restInit,
    });
  } catch (err) {
    if (timer) clearTimeout(timer);
    // Only show user-facing message when OUR internal timeout fired, not external aborts
    if (
      err instanceof DOMException &&
      err.name === "AbortError" &&
      timeoutController?.signal.aborted
    ) {
      throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }

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
