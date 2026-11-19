# Component development

- GitHub main is the source of truth. Keep the authorized Shopify draft synchronized with the reviewed version; do not publish a theme unless requested.
- Build reusable product grids and cards. Class names and component names must never contain store or client names.
- Keep each section's Liquid, schema, styles and scripts together. Reusable snippets may contain their own markup, styles and scripts.
- Order CSS from parent to descendants, with each media query beside the rules it changes.
- Preserve setting IDs and existing merchant configuration. Document migrations and host-theme dependencies.
- Current integration target: Dawn 15.2.0. Validate theme upgrades separately.
- Test filters, pagination and media on the actual draft at desktop and mobile widths. Distinguish emulation and unit tests from physical-device testing.
- Use Dawn's shared `card-product` snippet, with optional capabilities. Do not maintain a competing product-card implementation. The editorial collection grid remains an optional section.
- Enable new shared-card capabilities explicitly at each caller. A shared snippet change is not permission to activate the gallery in search, recommendations, featured collections or every grid.
- Keep reusable modules in this repository. Keep each client's complete theme, templates, settings and identity assets in a separate private repository. Do not upload a client theme wholesale to this public repository.
- Track the exact upstream Dawn version and review upgrades in a separate draft. The published theme and latest Dawn release are references, not backups of the current draft.
- Prefer native browser image loading with HTML src/srcset. Keep page pagination distinct from media loading; avoid hiding a whole card while waiting for image decoding.
- End user-facing delivery responses with remaining tasks in priority order.
