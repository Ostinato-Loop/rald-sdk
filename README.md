# @rald/sdk

**RALD OS SDK** — integrate your product with the RALD ecosystem in minutes.

One identity. One trust profile. One wallet. Unlimited products.

```bash
npm install @rald/sdk
```

---

## Quick Start

```typescript
import { RALDSDK } from "@rald/sdk";

const sdk = new RALDSDK({
  token:   process.env.RALD_API_TOKEN!,
  product: "my-product",           // identifies your product in logs
  baseUrl: "https://api.rald.cloud", // default
});

// Resolve any identity
const user = await sdk.identity.resolve("@boyd");
// → { rald_id: "rld_8dj39sj29x", rald_email: "boyd@rald.cloud", ... }

// Gate a high-value action by trust tier
const gate = await sdk.trust.gate(user.rald_id, {
  minTier:        "verified",
  blockFraud:     true,
  blockSanctions: true,
});
if (!gate.allowed) return res.status(403).json({ error: gate.reason });

// Route payment via ALIA handle
const alias = await sdk.alia.resolve("@boyd");
const walletId = alias.wallet_id; // "wallet_rld_8dj39sj29x"

// Provision a new user on first login (idempotent)
const report = await sdk.identity.provision();
// → { rald_id, rald_email, wallet_id, messenger_id, fully_provisioned: true }
```

---

## Environment Variables

```bash
RALD_API_TOKEN=your-service-jwt   # required
RALD_API_URL=https://api.rald.cloud  # optional, defaults to api.rald.cloud
RALD_PRODUCT=my-product           # optional, used in logs
```

Then use `fromEnv()`:

```typescript
import { fromEnv } from "@rald/sdk";
const sdk = fromEnv();
```

---

## Modules

### `sdk.identity` — Identity resolution and provisioning

```typescript
// Resolve by username, @handle, or rld_id
const user = await sdk.identity.resolve("@boyd");
const user = await sdk.identity.resolve("rld_8dj39sj29x");

// Provision new user after first login (idempotent)
const report = await sdk.identity.provision();

// Check provisioning status
const status = await sdk.identity.provisionStatus("rld_8dj39sj29x");
const isReady = await sdk.identity.isFullyProvisioned("rld_8dj39sj29x");
```

### `sdk.trust` — Trust gating

```typescript
// Get full trust profile
const trust = await sdk.trust.get("rld_8dj39sj29x");
// → { trust_tier: "verified", trust_score: 450, kyc_tier: 2, ... }

// Gate an action (most common pattern)
const gate = await sdk.trust.gate("rld_8dj39sj29x", {
  minTier:          "verified",   // "none"|"basic"|"verified"|"enhanced"|"elite"
  minKycTier:       1,
  merchantRequired: false,
  blockFraud:       true,
  blockSanctions:   true,
});
// → { allowed: true, trust } OR { allowed: false, reason: "...", trust }

// Simple tier check
const canSend = await sdk.trust.hasMinTier("rld_...", "basic");

// Trust leaderboard (public)
const top = await sdk.trust.leaderboard(20);
```

### `sdk.wallet` — Wallet resolution

```typescript
// Get wallet by rald_id
const wallet = await sdk.wallet.get("rld_8dj39sj29x");
// → { id: "wallet_rld_8dj39sj29x", status: "active", currency: "NGN" }

// Resolve wallet from @handle
const wallet = await sdk.wallet.fromUsername("@boyd");

// Check wallet is active before initiating payment
const active = await sdk.wallet.isActive("rld_8dj39sj29x");
```

### `sdk.alia` — ALIA handle resolution

```typescript
// Resolve ALIA handle → wallet + identity
const result = await sdk.alia.resolve("@boyd");
// → { handle: "@boyd", rald_id: "rld_...", wallet_id: "wallet_rld_...", ... }

// Check if handle is routable for payments
const ok = await sdk.alia.isRouteable("@boyd");

// Batch resolution (for bulk payment lists, etc.)
const map = await sdk.alia.resolveBatch(["@boyd", "@anna", "@unknown"]);
// → { "@boyd": { ... }, "@anna": { ... }, "@unknown": null }
```

### `sdk.mail` — Mail account resolution

```typescript
// Get mail account
const mail = await sdk.mail.get("rld_8dj39sj29x");
// → { address: "boyd@rald.cloud", status: "active", ... }

// Compute email without network call
const email = RaldMail.emailFor("boyd"); // "boyd@rald.cloud"
```

### `sdk.products` — Product registry and ecosystem health

```typescript
// List all active products
const products = await sdk.products.list();
// → [{ slug: "payrald", name: "PayRald", status: "active", ... }, ...]

// Get a specific product
const payrald = await sdk.products.get("payrald");

// Ecosystem health check
const health = await sdk.products.ecosystemHealth();
// → { ecosystem_health: "ok", products: [...], summary: { total: 8, healthy: 8 } }

// Single product health
const ok = await sdk.products.isHealthy("payrald");
```

---

## Error Handling

```typescript
import { RaldError, RaldNotFoundError, RaldForbiddenError } from "@rald/sdk";

try {
  const user = await sdk.identity.resolve("@unknown");
} catch (err) {
  if (err instanceof RaldNotFoundError) {
    // handle not found
  } else if (err instanceof RaldForbiddenError) {
    // handle auth/permissions error
  } else if (err instanceof RaldError) {
    console.error(err.statusCode, err.message, err.code);
  }
}
```

---

## TypeScript Types

```typescript
import type {
  RaldUser, TrustProfile, TrustSummary,
  WalletRecord, AliasRecord, MailAccount,
  RaldProduct, EcosystemHealth, ProvisionReport,
} from "@rald/sdk";
```

---

## API Endpoints

All SDK calls go through `api.rald.cloud` by default:

| SDK call | Endpoint |
|---|---|
| `identity.resolve(x)` | `GET /identity/:x` |
| `identity.provision()` | `POST /signup` |
| `identity.provisionStatus(id)` | `GET /signup/status/:id` |
| `trust.get(id)` | `GET /trust/:id` |
| `trust.gate(id, opts)` | `GET /trust/:id` (local gate logic) |
| `wallet.get(id)` | `GET /wallet/:id` |
| `alia.resolve(handle)` | `GET /alias/:handle` |
| `mail.get(id)` | `GET /mail/:id` |
| `products.list()` | `GET /products` |
| `products.ecosystemHealth()` | `GET /ecosystem/health` |

Direct service access (bypass gateway):

```typescript
const sdk = new RALDSDK({
  token:   token,
  baseUrl: "https://auth.rald.cloud", // direct auth access
});
```

---

## License

MIT · LILCKY STUDIO LIMITED · [rald.cloud](https://rald.cloud)
