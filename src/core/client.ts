// @rald/sdk — Base HTTP Client
// All SDK modules extend this to communicate with the RALD OS API.
// Supports api.rald.cloud (gateway) or direct service URLs.
// LILCKY STUDIO LIMITED · 2026-06-17

import type { RaldConfig } from "./types";
import {
  RaldError, RaldAuthError, RaldForbiddenError,
  RaldNotFoundError, RaldRateLimitError, RaldNetworkError,
} from "./errors";

export const DEFAULT_BASE_URL = "https://api.rald.cloud";

export class RaldClient {
  protected readonly config: Required<RaldConfig>;

  constructor(config: RaldConfig) {
    this.config = {
      token:   config.token,
      baseUrl: (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, ""),
      timeout: config.timeout ?? 10_000,
      product: config.product ?? "unknown",
    };
  }

  protected async request<T>(
    method:  "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path:    string,
    body?:   unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const reqHeaders: Record<string, string> = {
      "Authorization": `Bearer ${this.config.token}`,
      "X-RALD-Product": this.config.product,
      ...headers,
    };
    if (body !== undefined) reqHeaders["Content-Type"] = "application/json";

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: reqHeaders,
        body:    body !== undefined ? JSON.stringify(body) : undefined,
        signal:  AbortSignal.timeout(this.config.timeout),
      });
    } catch (err) {
      throw new RaldNetworkError(
        `Network error reaching ${url}: ${String(err)}`,
        err
      );
    }

    let data: unknown;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      data = await res.text().catch(() => "");
    }

    if (!res.ok) {
      const msg = (data as any)?.error ?? res.statusText ?? "Request failed";
      const code = (data as any)?.code;
      switch (res.status) {
        case 401: throw new RaldAuthError(msg);
        case 403: throw new RaldForbiddenError(msg);
        case 404: throw new RaldNotFoundError(msg);
        case 429: throw new RaldRateLimitError();
        default:  throw new RaldError(msg, res.status, code, data);
      }
    }

    return data as T;
  }

  protected _get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let fullPath = path;
    if (params) {
      const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&");
      if (qs) fullPath += `?${qs}`;
    }
    return this.request<T>("GET", fullPath);
  }

  protected post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  protected patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  protected delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  /** Update the API token (e.g., after token refresh) */
  setToken(token: string): void {
    (this.config as any).token = token;
  }

  /** Get current base URL */
  get baseUrl(): string { return this.config.baseUrl; }
}
