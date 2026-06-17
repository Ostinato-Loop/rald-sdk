// @rald/sdk — Identity Module
// Resolve identities, provision new users, check provisioning status.
// LILCKY STUDIO LIMITED · 2026-06-17

import { RaldClient } from "../core/client";
import type { RaldConfig, RaldUser, ProvisionReport } from "../core/types";

export interface ProvisionStatusResponse {
  rald_id:            string;
  username:           string;
  rald_email:         string;
  provision_status:   string;
  activated_products: string[];
  services: Array<{
    service:        string;
    provisioned:    boolean;
    status:         string;
    pending_retry:  boolean;
    retry_attempts: number;
    last_error:     string | null;
  }>;
  audit_trail: Array<{
    service:     string;
    event_type:  string;
    status:      "success" | "failed" | "skipped";
    duration_ms: number | null;
    created_at:  string;
  }>;
}

export class RaldIdentity extends RaldClient {
  constructor(config: RaldConfig) {
    // Identity resolves via api.rald.cloud/identity or auth.rald.cloud/signup
    super(config);
  }

  /**
   * Resolve a RALD identity by username or rald_id (rld_...) or @handle.
   * Returns the full identity with trust profile.
   *
   * @example
   * const user = await identity.resolve("@boyd");
   * const user = await identity.resolve("rld_8dj39sj29x");
   */
  async resolve(lookup: string): Promise<RaldUser> {
    const clean = lookup.replace(/^@/, "");
    return this._get<RaldUser>(`/identity/${encodeURIComponent(clean)}`);
  }

  /**
   * Provision a new RALD identity for the currently authenticated user.
   * Idempotent — safe to call multiple times.
   * Creates: rald_users record, wallet, ALIA handle, mailbox, messenger account.
   * Emits: identity.created event.
   *
   * Call this from your product after a user signs in for the first time.
   *
   * @example
   * const report = await identity.provision();
   * // report.rald_id → "rld_8dj39sj29x"
   * // report.rald_email → "boyd@rald.cloud"
   * // report.fully_provisioned → true
   */
  async provision(): Promise<ProvisionReport> {
    return this.post<ProvisionReport>("/signup");
  }

  /**
   * Check provisioning status for a rald_id.
   * Returns per-service status, retry queue state, and audit trail.
   */
  async provisionStatus(raldId: string): Promise<ProvisionStatusResponse> {
    return this._get<ProvisionStatusResponse>(`/signup/status/${raldId}`);
  }

  /**
   * Check if an identity is fully provisioned.
   * Convenience wrapper around provisionStatus.
   */
  async isFullyProvisioned(raldId: string): Promise<boolean> {
    const status = await this.provisionStatus(raldId);
    return status.provision_status === "complete";
  }

  /**
   * Get identities that match a username search.
   */
  async search(query: string, limit = 20): Promise<RaldUser[]> {
    const res = await this._get<{ users: RaldUser[] }>(`/search/users`, { q: query, limit });
    return res.users;
  }
}
