// @rald/sdk — Wallet Module
// PayRald wallet resolution and routing.
// SDK never handles balance directly — that's PayRald's domain.
// Products use this to verify wallet existence and route payments via ALIA.
// LILCKY STUDIO LIMITED · 2026-06-17

import { RaldClient } from "../core/client";
import type { RaldConfig, WalletRecord } from "../core/types";

export class RaldWallet extends RaldClient {
  constructor(config: RaldConfig) {
    super(config);
  }

  /**
   * Get wallet record for a rald_id.
   * Does NOT return balance — use PayRald API directly for balance.
   *
   * @example
   * const wallet = await raldWallet.get("rld_8dj39sj29x");
   * // wallet.id → "wallet_rld_8dj39sj29x"
   * // wallet.status → "active"
   */
  async get(raldId: string): Promise<WalletRecord> {
    return super.get<WalletRecord>(`/wallet/${encodeURIComponent(raldId)}`);
  }

  /**
   * Resolve a wallet from a username or ALIA handle.
   * Looks up the identity first, then returns the wallet record.
   *
   * @example
   * const wallet = await raldWallet.fromUsername("boyd");
   * const wallet = await raldWallet.fromUsername("@boyd");
   */
  async fromUsername(usernameOrHandle: string): Promise<WalletRecord & { rald_id: string; username: string }> {
    const clean = usernameOrHandle.replace(/^@/, "");
    const identity = await super.get<{ rald_id: string; username: string; wallet_id: string | null }>(
      `/identity/${encodeURIComponent(clean)}`
    );
    if (!identity.wallet_id) {
      throw new Error(`No wallet found for @${clean} — identity may not be fully provisioned`);
    }
    const wallet = await this.get(identity.rald_id);
    return { ...wallet, rald_id: identity.rald_id, username: identity.username };
  }

  /**
   * Check if a user's wallet is active.
   *
   * @example
   * const canPay = await raldWallet.isActive("rld_8dj39sj29x");
   */
  async isActive(raldId: string): Promise<boolean> {
    try {
      const wallet = await this.get(raldId);
      return wallet.status === "active";
    } catch {
      return false;
    }
  }
}
