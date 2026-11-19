# Validation — 19 November 2026, component v0.4

Target: authorized unpublished Dawn 15.2.0 draft. No theme publication or Dawn upgrade.

## Actual Shopify checks

- Re-read all 13 changed draft files through the code editor: exact matches with reviewed local source. Merchant configuration retained except requested new defaults and the displayed section rename.
- Global gallery off: no custom galleries; native card images return. Gallery on, scrollbar off: galleries retained and no scrollbar markup. Restored both enabled.
- Desktop gallery: navigation changes the image and active segment; bar visible on hover/focus, hidden after leaving the card. Track computed transparent; active segment equals theme foreground.
- Global layout: 2400 px value renders `--page-width:240rem`; restored full width and previous numeric setting. Both grid full-width options tested: grid left edge 0 and width equal to the 1952 px editor preview. Restored prior per-section values.
- Editorial desktop availability: In stock -> 26 of 29; subsequent page appends to 26 products with the editorial tile attached to its following product. Reset returns 29; automatic loading also observed after reset near the page end.
- Mobile viewport 390 × 844: Out of stock -> 3 of 29; Apply closes the drawer. Reset works; no horizontal overflow. Scrollbars hidden at rest.
- Product Group Variants: four Bubble links and loaded 60 × 60 thumbnails; correct current-product state. Keyboard focus reveals the associated name. Mobile width 390: no overflow.
- One of a kind: rendered on matching available products with transparent background and theme foreground.
- Header-height variable present; original native Dawn header-height contract retained.
- Temporary editor tests discarded; standard main grid remains hidden, editorial grid and existing Featured collection remain active. Browser preview returned to desktop size.

## Local checks

`npm test` passes: gallery touch/keyboard/range behavior, interaction timeout, scrollbar-absent behavior, filter serialization/cancellation, native image loading, pagination failure/duplicate handling, header observer feedback prevention.

Supplementary Liquid fixture rendering passes for grouped-product title fallback, escaping, alphabetical order, current-product state and empty groups. This uses LiquidJS with the stylesheet tag excluded; it does not replace Shopify rendering.

Official Shopify Theme Check reports no intrinsic parse/schema errors in the library files. Its 111 errors are missing host assets/snippets/translations; one orphaned-snippet warning is expected because the main-product render hook is distributed as a patch. A full host-theme lint is not represented by this partial-library check.

## Remaining validation scope

No physical iOS/Android device was available. Real touch swiping and scrollbar dragging remain a physical-device acceptance check; pointer-event tests and responsive desktop emulation are not equivalent. No new video override or Dawn upgrade was introduced in this change. Search/recommendation/quick-add combinations should be included in a broader site-wide acceptance pass before publishing the draft.
