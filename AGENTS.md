# Component development

- GitHub main is the source of truth. Keep the authorized Shopify draft synchronized with the reviewed version; do not publish a theme unless requested.
- Build reusable product grids and cards. Class names and component names must never contain store or client names.
- Keep each section's Liquid, schema, styles and scripts together. Reusable snippets may contain their own markup, styles and scripts.
- Order CSS from parent to descendants, with each media query beside the rules it changes.
- Preserve setting IDs and existing merchant configuration. Document migrations and host-theme dependencies.
- Current integration target: Dawn 15.2.0. Validate theme upgrades separately.
- Test filters, pagination and media on the actual draft at desktop and mobile widths. Distinguish emulation and unit tests from physical-device testing.
- Do not replace the standard product card throughout the site until the independent integration is validated and the migration is requested.
