const WP_URL = (process.env.WP_BACKEND_URL || "").trim().replace(/\/+$/, "");
const WP_CK = process.env.WP_CK || "";
const WP_CS = process.env.WP_CS || "";

if (process.env.NODE_ENV !== "production" || WP_URL.includes(".local") || WP_URL.includes("localhost")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export function getWpBaseUrl(): string {
  return (process.env.WP_BACKEND_URL || "").trim().replace(/\/+$/, "");
}

export function getWpAuthUrl(endpoint: string, extraParams?: Record<string, string>): string {
  const base = getWpBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${base}${cleanEndpoint}`);
  
  if (WP_CK) {
    url.searchParams.set("consumer_key", WP_CK);
  }
  if (WP_CS) {
    url.searchParams.set("consumer_secret", WP_CS);
  }
  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  return url.toString();
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
