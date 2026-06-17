// @rald/sdk — ALIA Module
// Alias resolution for payments and messaging.
// ALIA (@boyd) resolves to a wallet and identity across the RALD network.
// LILCKY STUDIO LIMITED · 2026-06-17

import { RaldClient } from "../core/client";
import type { RaldConfig, AliasRecord } from "../core/types";

export interface AliasResolutionResult {
  handle:     string;
  rald_id:    string;
  wallet_id:  string | null;
  rald_email: string | null;
  username:   string | null;
  status:     "active" | "suspended" | "reserved";
}

export class RaldAlia extends RaldClient {
  constructor(config: RaldConfig) {
    super(config);
  }

  /**
   * Resolve an ALIA handle to identity + wallet.
   * Accepts "@boyd", "boyd", or "boyd@rald.cloud".
   *
   * @example
   * const result = await raldAlia.resolve("@boyd");
   * // result.wallet_id → "wallet_rld_8dj39sj29x"
   * // result.rald_id  → "rld_8dj39sj29x"
   */
  async resolve(handle: string): Promise<AliasResolutionResult> {
    // Normalize: strip @ and @rald.cloud suffix
    const clean = handle.replace(/^@/, "").replace(/@rald\.cloud$/, "");
    const alias = await this._get<AliasRecord>(`/alias/${encodeURIComponent(clean)}`);

    return {
      handle:     alias.handle,
      rald_id:    alias.rald_id,
      wallet_id:  alias.identity?.wallet_id ?? null,
      rald_email: alias.identity?.rald_email ?? null,
      username:   alias.identity?.username ?? null,
      status:     alias.status,
    };
  }

  /**
   * Check if an ALIA handle is active and available for payment routing.
   *
   * @example
   * const canRoute = await raldAlia.isRouteable("@boyd");
   */
  async isRouteable(handle: string): Promise<boolean> {
    try {
      const result = await this.resolve(handle);
      return result.status === "active" && !!result.wallet_id;
    } catch {
      return false;
    }
  }

  /**
   * Resolve multiple handles at once.
   * Returns a map from handle → result (null if not found).
   *
   * @example
   * const map = await raldAlia.resolveBatch(["@boyd", "@anna", "@unknown"]);
   * // map["@boyd"] → AliasResolutionResult
   * // map["@unknown"] → null
   */
  async resolveBatch(handles: string[]): Promise<Record<string, AliasResolutionResult | null>> {
    const results = await Promise.allSettled(handles.map(h => this.resolve(h)));
    const map: Record<string, AliasResolutionResult | null> = {};
    handles.forEach((h, i) => {
      const clean = `@${h.replace(/^@/, "")}`;
      map[clean] = results[i].status === "fulfilled" ? results[i].value : null;
    });
    return map;
  }
}
