# Validation — 20 November 2026, component v0.5

Target: authorized unpublished Dawn 15.2.0 draft. No theme publication, account change or Dawn upgrade.

## Actual Shopify checks

- Audited the five current collection templates before consolidation. Migrated the former editorial instance to the canonical native section type, preserving its instance ID, order and settings; removed the redundant disabled native instance. Other templates retain their grid settings and default to editorial media off.
- Read back the three reusable Liquid files, global schema, layout, merchant settings, default collection template and inert legacy migration marker through the code editor: exact matches with reviewed local files. Merchant snapshots remain local and ignored by Git.
- Enable pagination is enabled by default and on the migrated instance; its control precedes Products per page. The maximum of 72 was exercised in the actual editor against a 70-product collection. The obsolete lazy-load and three mapping controls are absent.
- Numbered pagination: 36 products on page 1, 34 on page 2 of a 70-product collection; editorial cadence continues across the boundary. Earlier 16/13-page checks also passed on a 29-product collection. Availability filtering from page 2 resets the page parameter and returns matching products.
- Automatic mode in the actual editor: 36 products become 70 after the next-page link enters view; four editorial tiles, no duplicate products and no next link at the end. Restored numbered mode; temporary editor changes were not saved.
- Mobile emulation at 390 × 844: page 2 returns 34 products; Out of stock returns 9, removes the page parameter, and Apply closes the drawer even during the request. Body scroll lock and aria-expanded are cleared. No horizontal overflow. Editorial tiles measure 360 × 480 (3:4).
- Desktop availability/reset and the shared native-style Bracelets collection were exercised. Bracelets renders the consolidated grid with no editorial tiles; sorting updates the URL and product results without Liquid errors.
- Page width accepts 1920 in the actual editor and renders --page-width:192.0rem. Restored the merchant's 1900 numeric value and full-width mode. Full-width Product grid and Featured collection share the 15 px desktop card edge; tablet gutters follow the native 50 px rule.
- Global indicator style: Bar renders bar controls with no Steps markup; Steps restores the short-line indicators. Final saved setting is Steps. Keyboard and arrow navigation update the active image/segment. Active and inactive colors use the theme foreground; resting opacity is zero.
- Editorial dispatch: an existing custom image/title override remains; a collection-only entry receives its title, featured image and URL. Existing empty merchant blocks were preserved.

## Local checks

npm test passes (nine behavioral cases): touch/swipe, keyboard/range and Steps state, optional indicator absence, filter serialization/cancellation, native image loading, duplicate page requests and failure fallback, numbered-link behavior, Apply during a pending response, and header observer behavior.

Official Shopify Theme Check on the staged component/host excerpt reports no Liquid/schema/JSON syntax errors. Missing assets, templates, sections and translations are expected because this is not a complete theme export. The recovered host layout still reports its pre-existing parser-blocking header script and scheme_classes warning. This is not a claim of a clean full-theme lint.

## Remaining scope

1. Physical iOS/Android swipe and indicator dragging acceptance; responsive emulation and DOM tests do not replace a real device.
2. Review the proposed collection hierarchy and its destinations before installing contextual navigation; no taxonomy, menus or product data were changed.
3. Prepare a separate Dawn 16.2 upgrade evaluation after the current implementation is approved, including accounts, cart, apps, search/recommendations, quick add and existing video overrides before publication.
