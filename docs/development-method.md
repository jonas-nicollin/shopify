# Development method

## Simple default workflow

- **Shopify** holds the working theme, merchant settings, templates and client identity. Work in an authorized draft.
- **This GitHub repository** holds reviewed reusable modules, small host integration patches and their data/dependency contracts. Main is the source of truth for these modules.
- **An exact backup** (theme duplicate and ZIP) preserves the current draft before migrations or Dawn upgrades. The published theme may lack recent draft work and is not an equivalent backup.
- A private repository containing the complete client theme is optional. It helps with line-by-line history, rollback and team deployment, but is not required for the present workflow. Do not upload complete themes, merchant settings or client fonts to this public library.

Record the installed component commit and the exact Dawn version per site. Shared modules may be installed à la carte; client-specific presentation remains in the host theme. A future module update must preserve those choices rather than replace all settings with defaults.

## Component boundaries

The agreed architecture is one shared Dawn card and one Product grid with optional editorial media. Gallery and indicator settings are global under Theme settings > Product cards; image ratios remain section-specific. Version 0.5 consolidates both former grids under main-collection-product-grid.liquid. Follow the documented template migration while preserving instance IDs, order and merchant settings. Numbered pagination is enabled by default; automatic page loading remains optional.

Featured collection serves a different context: a selected collection/subset, with carousel/view-all options. It shares cards and can share layout controls without becoming the main filtered collection listing.

Keep section Liquid/schema/styles/scripts together and reusable snippets self-contained. Use Dawn's existing prices, quick add, facets, accessible drawers, icons and theme color schemes. This is a maintained Dawn extension, not a rewrite of every commerce primitive.

## Change workflow

1. Compare GitHub main, local changes and the actual draft. Back up touched host files and preserve merchant configuration.
2. Prepare and review the change; validate relevant behavior locally.
3. Install only intended files/hooks into the authorized draft. Verify desktop/mobile widths and affected shared-card callers. Distinguish responsive emulation from physical-device testing.
4. Synchronize reviewed reusable code to GitHub main and record what is installed. This manual workflow does not imply automatic GitHub deployment.
5. Publish only on explicit request.

## Dawn upgrades

Current integration target remains **Dawn 15.2.0**; no upgrade is included in this work.

Shopify may carry compatible code edits into an updated theme, but conflicts require manual work. Use the updated copy as a separate draft, check Shopify's code-transfer result, and compare the [module/hook manifest](installation.md). Reinstall missing module files and reconcile the small native-file changes, preserving settings and app integration. Test the resulting whole theme before publication.

Neither a component library nor a complete-theme Git repository guarantees automatic upgrades. The protection is an exact backup, documented changes, and validation of the new draft. A full-theme repository adds comparison/history convenience; it does not replace those steps.

Source: [Shopify theme updates](https://help.shopify.com/en/manual/online-store/themes/managing-themes/updating-themes).
