// @rald/sdk — Core Types
// Shared across all RALD SDK modules.
// LILCKY STUDIO LIMITED · 2026-06-17

export interface RaldConfig {
  /** Your RALD API token (service key or user JWT) */
  token: string;
  /**
   * Override the base URL. Defaults to https://api.rald.cloud
   * Set to https://auth.rald.cloud for direct access without gateway.
   */
  baseUrl?: string;
  /** Request timeout in ms. Default: 10000 */
  timeout?: number;
  /** Product slug — identifies which product is making the request */
  product?: string;
}

export interface RaldUser {
  rald_id:            string;
  username:           string;
  rald_email:         string;
  alia_handle:        string;
  wallet_id:          string | null;
  messenger_id:       string | null;
  mail_id:            string | null;
  activated_products: string[];
  provision_status:   "provisioning" | "complete" | "partial" | "failed";
  trust:              TrustSummary | null;
  created_at:         string;
}

export interface TrustSummary {
  tier:           "none" | "basic" | "verified" | "enhanced" | "elite";
  score:          number;
  kyc_tier:       number;
  is_merchant:    boolean;
  is_creator:     boolean;
  is_school:      boolean;
  fraud_flagged:  boolean;
}

export interface TrustProfile {
  rald_id:           string;
  trust_score:       number;
  trust_tier:        "none" | "basic" | "verified" | "enhanced" | "elite";
  kyc_tier:          number;
  fraud_score:       number;
  reputation_score:  number;
  merchant_score:    number;
  school_score:      number;
  phone_verified:    boolean;
  email_verified:    boolean;
  bvn_verified:      boolean;
  is_merchant:       boolean;
  is_creator:        boolean;
  is_school:         boolean;
  fraud_flagged:     boolean;
  sanctions_flagged: boolean;
  last_computed_at:  string;
}

export interface WalletRecord {
  id:         string;
  rald_id:    string;
  currency:   string;
  status:     "active" | "suspended" | "closed";
  created_at: string;
}

export interface MailAccount {
  id:           string;
  rald_id:      string;
  address:      string;
  display_name: string | null;
  status:       "active" | "suspended" | "deleted";
  created_at:   string;
}

export interface AliasRecord {
  id:       string;
  rald_id:  string;
  handle:   string;
  status:   "active" | "suspended" | "reserved";
  identity: {
    username:           string;
    rald_email:         string;
    wallet_id:          string | null;
    activated_products: string[];
  } | null;
  created_at: string;
}

export interface RaldProduct {
  slug:           string;
  name:           string;
  description:    string | null;
  status:         "active" | "beta" | "disabled" | "deprecated";
  base_url:       string | null;
  api_endpoint:   string | null;
  icon_url:       string | null;
  billing_model:  "free" | "subscription" | "usage" | "revenue_share";
  auto_provision: boolean;
  permissions:    string[];
}

export interface ProvisionReport {
  rald_id:           string;
  username:          string;
  rald_email:        string;
  alia_handle:       string;
  wallet_id:         string;
  messenger_id:      string;
  mail_id:           string;
  provisioned:       string[];
  failed:            Array<{ service: string; error: string }>;
  queued_for_retry:  string[];
  fully_provisioned: boolean;
  duration_ms:       number;
}

export interface EcosystemHealth {
  ecosystem_health: "ok" | "degraded" | "down";
  products: Array<{
    slug:       string;
    name:       string;
    health:     "ok" | "degraded" | "down" | "unknown";
    latency_ms?: number;
  }>;
  summary: {
    total:   number;
    healthy: number;
    degraded: number;
  };
  generated_at: string;
}
