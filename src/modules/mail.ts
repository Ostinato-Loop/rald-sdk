// @rald/sdk — Mail Module
// Resolve RALD mail accounts (boyd@rald.cloud).
// LILCKY STUDIO LIMITED · 2026-06-17

import { RaldClient } from "../core/client";
import type { RaldConfig, MailAccount } from "../core/types";

export class RaldMail extends RaldClient {
  constructor(config: RaldConfig) { super(config); }

  /**
   * Get mail account for a rald_id.
   *
   * @example
   * const mail = await raldMail.get("rld_8dj39sj29x");
   * // mail.address → "boyd@rald.cloud"
   */
  async get(raldId: string): Promise<MailAccount> {
    return super.get<MailAccount>(`/mail/${encodeURIComponent(raldId)}`);
  }

  /**
   * Resolve a RALD email address from a username.
   * Returns "username@rald.cloud" without making a network call.
   * Use get() if you need to verify the account exists.
   */
  static emailFor(username: string): string {
    return `${username.toLowerCase().replace(/^@/, "")}@rald.cloud`;
  }
}
