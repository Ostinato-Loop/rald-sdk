// @rald/sdk — Trust Module
// Read and react to RALD trust profiles.
// Every product should gate high-risk actions on trust tier.
// LILCKY STUDIO LIMITED · 2026-06-17

import { RaldClient } from "../core/client";
import type { RaldConfig, TrustProfile } from "../core/types";

export type TrustTier = "none" | "basic" | "verified" | "enhanced" | "elite";

const TIER_ORDER: Record<TrustTier, number> = {
  none: 0, basic: 1, verified: 2, enhanced: 3, elite: 4,
};

export interface TrustGateOptions {
  /** Minimum tier required (inclusive). Default: "basic" */
  minTier?:          TrustTier;
  /** Require KYC tier >= this level */
  minKycTier?:       number;
  /** Allow merchants only */
  merchantRequired?: boolean;
  /** Block if fraud_flagged */
  blockFraud?:       boolean;
  /** Block if sanctions_flagged */
  blockSanctions?:   boolean;
}

export interface TrustGateResult {
  allowed:    boolean;
  reason?:    string;
  trust:      TrustProfile;
}

export class RaldTrust extends RaldClient {
  constructor(config: RaldConfig) {
    super(config);
  }

  /**
   * Get the full trust profile for a rald_id.
   * Use this to gate features based on trust tier, KYC tier, or fraud flags.
   *
   * @example
   * const trust = await raldTrust.get("rld_8dj39sj29x");
   * if (trust.trust_tier === "none") blockTransfer();
   */
  async getProfile(raldId: string): Promise<TrustProfile> {
    return this._get<TrustProfile>(`/trust/${encodeURIComponent(raldId)}`);
  }

  /** Get your own trust profile (authenticated user) */
  async me(): Promise<TrustProfile> {
    return this._get<TrustProfile>("/trust-engine/me");
  }

  /**
   * Gate an action based on trust requirements.
   * Returns { allowed: true } or { allowed: false, reason: "..." }.
   *
   * @example
   * const gate = await trust.gate("rld_8dj39sj29x", { minTier: "verified", blockFraud: true });
   * if (!gate.allowed) return res.status(403).json({ error: gate.reason });
   */
  async gate(raldId: string, options: TrustGateOptions = {}): Promise<TrustGateResult> {
    const {
      minTier        = "basic",
      minKycTier     = 0,
      merchantRequired = false,
      blockFraud     = true,
      blockSanctions = true,
    } = options;

    const trust = await this.getProfile(raldId);

    if (blockFraud && trust.fraud_flagged) {
      return { allowed: false, reason: "Account flagged for fraud review", trust };
    }
    if (blockSanctions && trust.sanctions_flagged) {
      return { allowed: false, reason: "Account under sanctions review", trust };
    }
    if (TIER_ORDER[trust.trust_tier] < TIER_ORDER[minTier]) {
      return { allowed: false, reason: `Requires ${minTier} trust tier (current: ${trust.trust_tier})`, trust };
    }
    if (trust.kyc_tier < minKycTier) {
      return { allowed: false, reason: `Requires KYC tier ${minKycTier} (current: ${trust.kyc_tier})`, trust };
    }
    if (merchantRequired && !trust.is_merchant) {
      return { allowed: false, reason: "Merchant account required", trust };
    }

    return { allowed: true, trust };
  }

  /**
   * Check if a user has at least the given trust tier.
   *
   * @example
   * const canTransfer = await trust.hasMinTier("rld_...", "verified");
   */
  async hasMinTier(raldId: string, minTier: TrustTier): Promise<boolean> {
    const trust = await this.getProfile(raldId);
    return TIER_ORDER[trust.trust_tier] >= TIER_ORDER[minTier];
  }

  /**
   * Get top trust leaderboard (public scores).
   */
  async leaderboard(limit = 20): Promise<Array<{
    rald_id: string; trust_score: number; trust_tier: TrustTier;
    is_merchant: boolean; is_creator: boolean; is_school: boolean;
  }>> {
    const res = await this._get<{ leaderboard: any[] }>("/trust-engine/leaderboard", { limit });
    return res.leaderboard;
  }

}
