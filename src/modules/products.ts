// @rald/sdk — Products Module
// Access the RALD Product Registry and ecosystem health.
// LILCKY STUDIO LIMITED · 2026-06-17

import { RaldClient } from "../core/client";
import type { RaldConfig, RaldProduct, EcosystemHealth } from "../core/types";

export class RaldProducts extends RaldClient {
  constructor(config: RaldConfig) { super(config); }

  /**
   * List all active/beta RALD products.
   *
   * @example
   * const products = await raldProducts.list();
   * // [{ slug: "payrald", name: "PayRald", status: "active" }, ...]
   */
  async list(status: "active" | "beta" | "all" = "active"): Promise<RaldProduct[]> {
    const res = await super.get<{ products: RaldProduct[] }>(
      "/products",
      status === "all" ? undefined : { status }
    );
    return res.products;
  }

  /**
   * Get a single product by slug.
   *
   * @example
   * const payrald = await raldProducts.get("payrald");
   */
  async get(slug: string): Promise<RaldProduct> {
    return super.get<RaldProduct>(`/products/${encodeURIComponent(slug)}`);
  }

  /**
   * Aggregate health check of all active products.
   * Returns ecosystem_health: "ok" | "degraded" | "down"
   *
   * @example
   * const health = await raldProducts.ecosystemHealth();
   * if (health.ecosystem_health !== "ok") alertOps(health);
   */
  async ecosystemHealth(): Promise<EcosystemHealth> {
    return super.get<EcosystemHealth>("/ecosystem/health");
  }

  /**
   * Check if a specific product is healthy.
   *
   * @example
   * const ok = await raldProducts.isHealthy("payrald");
   */
  async isHealthy(slug: string): Promise<boolean> {
    try {
      const res = await super.get<{ health: string }>(`/products/${slug}/health`);
      return res.health === "ok";
    } catch {
      return false;
    }
  }
}
