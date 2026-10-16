const WP_URL = process.env.WP_BACKEND_URL || "https://headless.local";
const WP_CK = process.env.WP_CK || "";
const WP_CS = process.env.WP_CS || "";

if (process.env.NODE_ENV !== "production" || WP_URL.includes(".local") || WP_URL.includes("localhost")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export function getWpBaseUrl(): string {
  let url = WP_URL.trim().replace(/\/+$/, "");
  if (url.startsWith("http://headless.local")) {
    url = url.replace("http://", "https://");
  }
  return url;
}

export function getWpAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (WP_CK && WP_CS) {
    headers["Authorization"] = "Basic " + Buffer.from(`${WP_CK}:${WP_CS}`).toString("base64");
    headers["X-WC-Consumer-Key"] = WP_CK;
    headers["X-WC-Consumer-Secret"] = WP_CS;
  }
  return headers;
}
