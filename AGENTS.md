# Component development

- GitHub main is the source of truth. Keep the authorized Shopify draft synchronized with the reviewed version; do not publish a theme unless requested.
- Build reusable product grids and cards. Class names and component names must never contain store or client names.
- Keep each section's Liquid, schema, styles and scripts together. Reusable snippets may contain their own markup, styles and scripts.
- Order CSS from parent to descendants, with each media query beside the rules it changes.
- Preserve setting IDs and existing merchant configuration. Document migrations and host-theme dependencies.
- Current integration target: Dawn 15.2.0. Validate theme upgrades separately.
- Test filters, pagination and media on the actual draft at desktop and mobile widths. Distinguish emulation and unit tests from physical-device testing.
- Use Dawn's shared `card-product` snippet, with optional capabilities. Do not maintain a competing product-card implementation. Use one Product grid section with optional editorial media; its consolidation was requested on 20 November 2026.
- Shared-card gallery and scrollbar activation belong to Theme settings > Product cards. This global migration was explicitly requested on 19 November 2026. Validate affected callers; do not add competing per-section gallery toggles.
- Keep reusable modules and small host integration patches in this repository; use Shopify as the working theme. A private complete-theme repository is optional. Always preserve an exact draft backup before upgrades. Never upload merchant settings, client assets or a complete client theme to this public library.
- Track the exact upstream Dawn version and review upgrades in a separate draft. The published theme and latest Dawn release are references, not backups of the current draft.
- Prefer native browser image loading with HTML src/srcset. Keep page pagination distinct from media loading; avoid hiding a whole card while waiting for image decoding.
- End user-facing delivery responses with remaining tasks in priority order.
- Use theme color variables or configured color schemes for all new component UI; do not hard-code brand colors.
- Do not introduce letter spacing unless explicitly requested. Product card information inherits the theme font, uses one text size, and keeps spacing on card__information rather than inner text margins.
