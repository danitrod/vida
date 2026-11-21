import { headers } from "next/headers";
import { describeDevice } from "@/lib/device";

// Server component for posts: <ReaderDevice /> renders the reader's kind of
// device ("iPhone", "Mac", "celular Android", ...), or "dispositivo" when
// unknown. Available in every MDX post without an import (mdx-components).
export default async function ReaderDevice() {
  const ua = (await headers()).get("user-agent");
  return <>{describeDevice(ua)}</>;
}
