// @rald/sdk — Main Entry Point
// RALD OS Software Development Kit
// Integrates your product with the RALD ecosystem in minutes.
// LILCKY STUDIO LIMITED · 2026-06-17
//
// Usage:
//   import { RALDSDK } from "@rald/sdk";
//   const sdk = new RALDSDK({ token: "your-jwt" });
//   const user = await sdk.identity.resolve("@boyd");
//   const gate = await sdk.trust.gate(user.rald_id, { minTier: "verified" });

export * from "./core/types";
export * from "./core/errors";
export { RaldClient }       from "./core/client";
export { RaldIdentity }     from "./modules/identity";
export { RaldTrust }        from "./modules/trust";
export { RaldWallet }       from "./modules/wallet";
export { RaldAlia }         from "./modules/alia";
export { RaldMail }         from "./modules/mail";
export { RaldProducts }     from "./modules/products";

import { RaldIdentity }  from "./modules/identity";
import { RaldTrust }     from "./modules/trust";
import { RaldWallet }    from "./modules/wallet";
import { RaldAlia }      from "./modules/alia";
import { RaldMail }      from "./modules/mail";
import { RaldProducts }  from "./modules/products";
import type { RaldConfig } from "./core/types";

export const SDK_VERSION = "1.0.0";

/**
 * RALDSDK — unified entry point for the RALD ecosystem.
 *
 * @example
 * ```typescript
 * import { RALDSDK } from "@rald/sdk";
 *
 * const sdk = new RALDSDK({
 *   token:   process.env.RALD_API_TOKEN!,
 *   product: "my-product",
 * });
 *
 * // Resolve an identity
 * const user = await sdk.identity.resolve("@boyd");
 *
 * // Gate a payment by trust tier
 * const gate = await sdk.trust.gate(user.rald_id, {
 *   minTier:       "verified",
 *   blockFraud:    true,
 *   blockSanctions: true,
 * });
 * if (!gate.allowed) throw new Error(gate.reason);
 *
 * // Resolve ALIA handle for payment routing
 * const alias = await sdk.alia.resolve("@boyd");
 * const walletId = alias.wallet_id; // wallet_rld_8dj39sj29x
 *
 * // Check ecosystem health
 * const health = await sdk.products.ecosystemHealth();
 * ```
 */
export class RALDSDK {
  readonly identity: RaldIdentity;
  readonly trust:    RaldTrust;
  readonly wallet:   RaldWallet;
  readonly alia:     RaldAlia;
  readonly mail:     RaldMail;
  readonly products: RaldProducts;
  readonly version:  string = SDK_VERSION;

  constructor(config: RaldConfig) {
    this.identity = new RaldIdentity(config);
    this.trust    = new RaldTrust(config);
    this.wallet   = new RaldWallet(config);
    this.alia     = new RaldAlia(config);
    this.mail     = new RaldMail(config);
    this.products = new RaldProducts(config);
  }

  /**
   * Update the auth token across all modules (e.g., after refresh).
   */
  setToken(token: string): void {
    [this.identity, this.trust, this.wallet, this.alia, this.mail, this.products]
      .forEach(m => m.setToken(token));
  }
}

/**
 * Quick helper to create the SDK from environment variables.
 * Reads RALD_API_TOKEN and RALD_API_URL automatically.
 *
 * @example
 * const sdk = fromEnv(); // reads RALD_API_TOKEN, RALD_API_URL
 */
export function fromEnv(overrides?: Partial<RaldConfig>): RALDSDK {
  const token = overrides?.token
    ?? (typeof process !== "undefined" ? process.env.RALD_API_TOKEN : undefined)
    ?? (typeof globalThis !== "undefined" ? (globalThis as any).RALD_API_TOKEN : undefined);

  if (!token) {
    throw new Error(
      "RALD_API_TOKEN environment variable is required. " +
      "Set it or pass { token } explicitly to new RALDSDK(config)."
    );
  }

  return new RALDSDK({
    token,
    baseUrl: overrides?.baseUrl
      ?? (typeof process !== "undefined" ? process.env.RALD_API_URL : undefined)
      ?? "https://api.rald.cloud",
    product: overrides?.product
      ?? (typeof process !== "undefined" ? process.env.RALD_PRODUCT : undefined),
    ...overrides,
  });
}
