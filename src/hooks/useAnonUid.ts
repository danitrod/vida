import { useSyncExternalStore } from "react";
import Cookies from "js-cookie";
import { anonCookie } from "@/lib/cookies";

// The anon cookie is browser-only state. Reading it through
// useSyncExternalStore returns null during SSR and hydration and the real
// value right after, without a setState-in-effect round trip.

// The cookie has no change event; it is re-read on every render, which is
// enough because it only changes as a side effect of requests that re-render
// the comment list.
const subscribe = () => () => {};

function getAnonUid(): string | null {
  const token = Cookies.get(anonCookie);
  if (!token) return null;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return typeof decoded?.uid === "string" ? decoded.uid : null;
  } catch (err) {
    console.error("Invalid anon token", err);
    return null;
  }
}

export function useAnonUid(): string | null {
  return useSyncExternalStore(subscribe, getAnonUid, () => null);
}
