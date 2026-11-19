# Development method

Decision approved on 19 November 2026: **shared Dawn product card, optional editorial collection grid**.

## Repository boundaries

1. This public repository is the reusable component library. Keep section Liquid, schema, CSS and JavaScript together; use shared snippets when they have a clear reusable responsibility.
2. A private repository per client should contain the complete theme, including templates and settings, the exact starting snapshot, and the code installed for that client. It is the deployable integration, not a second independently edited copy of the component library.
3. Maintain a clean upstream Dawn reference at an exact release tag. Record each integration's component commit and Dawn version. Upgrade components deliberately; never overwrite client configuration with library defaults.

The complete-theme repository is recommended but has not been created or populated by this change. The current public component repository must not receive a wholesale client export, licensed client fonts, or merchant settings.

## Common and optional behavior

`snippets/card-product.liquid` is the common card. Its `enable_card_gallery` argument defaults to false when omitted. Only the editorial collection section currently enables it, through its existing setting. Search, recommendations, native grids and featured collections keep their current behavior. The native grid remains available; keep only one collection grid active per template.

The media ratio resolver is shared between actual and placeholder cards. Ratios and gallery/editorial activation belong to the calling section; global card appearance belongs to theme settings. Add a global default only if several sections need an explicit “inherit theme default” option. Avoid two competing controls silently overriding each other.

Store-specific visual identity belongs to the private theme integration. Component selectors and names must remain generic. Do not move all custom CSS into a shared library merely because it currently lives in `base.css`.

## Change workflow

1. Read GitHub main and the actual draft before editing. Preserve merchant values and capture original files locally.
2. Review changes and run relevant tests locally. Install only the intended files into the authorized draft.
3. Verify the actual storefront and editor at desktop/mobile widths; test the affected feature and shared-card consumers when enabled there. Record physical-device gaps separately.
4. Commit the reviewed source to main and check that the draft's installed files match. This manual upload workflow does not imply automatic GitHub deployment.
5. Publish only on an explicit request. Keep a commit/tag of the exact pre-deployment theme in the private integration repository.

The currently published theme and latest upstream Dawn are useful comparison points, but neither preserves unpublished draft settings or intermediate custom work. They cannot replace an exact snapshot.

## Dawn updates

Current target: **Dawn 15.2.0**. Dawn **16.2.0** is available as of 19 November 2026. Test upgrades separately; no upgrade is included here.

- 16.0 introduces the customer-account popover and removes legacy customer-account templates/sections. Check account migration before publishing an upgraded theme.
- 16.1.1 includes bulk quick-add / quick-order and cart fixes.
- 16.2 adds retail stock-location information in the pickup-availability drawer.

These are relevant when the shop uses the affected features; they do not supply the editorial grid/gallery developed here. Review upstream changes against a clean 15.2.0 baseline, then port only the integration differences to a separate upgrade draft. Test accounts, cart, quick add, filters, product media, apps and custom sections before switching.

Shopify can carry compatible code edits forward during theme updates, but conflicting customizations still need manual review. A heavily customized theme should budget for this review rather than promise automatic upgrades.

Sources: [Dawn releases](https://github.com/Shopify/dawn/releases), [Dawn 16.0](https://github.com/Shopify/dawn/releases/tag/v16.0.0), [Shopify theme updates](https://help.shopify.com/en/manual/online-store/themes/managing-themes/updating-themes).
