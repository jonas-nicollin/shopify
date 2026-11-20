# When to upgrade Dawn

Reviewed 20 November 2026. Current integration target remains Dawn 15.2.0; no upgrade was performed.

Latest official release checked: [Dawn 16.2.0](https://github.com/Shopify/dawn/releases/tag/v16.2.0), 16 November 2026. It adds retail stock visibility in the pickup availability drawer, including stores without pickup. This matters when physical stock visibility is part of the shop experience.

[Dawn 16.1.1](https://github.com/Shopify/dawn/releases/tag/v16.1.1) fixes quantity changes/removals involving split discount lines, Enter in cart quantity inputs, and cart refresh after storefront integrations update it. [Dawn 16.0.0](https://github.com/Shopify/dawn/releases/tag/v16.0.0) adopts the new customer-account popover and removes legacy account templates. Confirm the store has migrated off legacy customer accounts before publishing a v16 theme. [Dawn 15.5.0](https://github.com/Shopify/dawn/releases/tag/v15.5.0), included on the path from 15.2, also brought accessibility/performance improvements and storefront event support.

Recommended timing: stabilize the current component migration first; then prepare 16.2 in a separate draft before a major launch or when one of its changes solves an observed issue. A new version number alone is not a reason to interrupt a working design implementation. Security fixes, platform incompatibilities or checkout/cart defects take priority over visual feature development.

1. Duplicate and export the exact working draft, recording the installed library commit.
2. Add the upgrade as another draft. Read Shopify's report of copied custom code; don't assume every change was retained.
3. Compare the module manifest, host hooks, settings schemas, template types, collection/product metafield contracts, app integrations and customer-account behavior.
4. Reapply missing integrations, then test product variants, cart and discounts, accounts, filters, numbered/automatic pagination, image/video galleries, desktop and mobile.
5. Publish only after explicit approval; retain the previous theme for rollback.

Shopify stays the working theme and this public repository stays the reusable component library. Recommend a private full-theme repository when exact cross-file diffs become necessary for repeated upgrades, multiple developers edit concurrently, or the number of client-specific changes makes the manifest/ZIP workflow unreliable. Its introduction is a separate workflow decision, not a prerequisite for every change.
