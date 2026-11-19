# Draft customization audit — 19 November 2026

The actual Dawn 15.2.0 draft files were copied from Shopify's code editor before modification. Full local evidence is excluded from this public repository. The existing `base.css`, product section, native collection section and merchant templates were not rewritten as part of this audit.

## base.css

Compared with the official [Dawn 15.2.0 base.css](https://github.com/Shopify/dawn/blob/v15.2.0/assets/base.css), the draft contains a roughly 510-line custom prefix plus 19 replacement regions in the upstream body, largely typography. It is not a clean upstream file with only one isolated override at the end.

| Existing customization | Effect / recommended ownership |
| --- | --- |
| Custom font declarations and global typography | Client identity; keep in the private theme integration |
| Desktop/mobile title and price sizes, card spacing, underlines and badges | Affect every matching native card; review before migrating to common-card settings |
| Grid spacing overrides | Affect grid layout beyond this editorial section |
| Product Group Variants CSS, lines 142–230 | Move alongside the future shared snippet, after preserving the current appearance |
| Product-page, slider, back-in-stock and miscellaneous overrides | Separate by owning component; do not delete as incidental card work |

Concrete cleanup findings in the captured file:

- Lines 449 and 470 contain `width: ~"calc(...)"`. This is LESS escaping inside a plain CSS asset; those declarations are invalid CSS and are ignored by the browser. Use ordinary `calc(...)` when fixing these rules.
- Line 425 contains `product-infoproduct-info`, which appears to be a duplicated custom-element name and will not target the normal `product-info` element.
- Lines 85 and 124 start selectors with `XXX` / `xxx`; they appear deliberately disabled and should be classified before removal.
- A back-in-stock override targets a particular product-section ID, which is not portable across theme instances.
- Group thumbnails have 48×48 HTML dimensions while CSS displays them at 60×60.

The old caret inset came from Dawn's normal `.card__media` image-padding geometry. The new gallery keeps the image inset and positions the carets outside it. No broad `base.css` rewrite was necessary.

## Loading

The native collection grid uses browser image loading plus Dawn's scroll animation and a locally integrated Ajaxinate script for subsequent pages. The editorial section previously deferred image URLs and hid entire cards while waiting for decode. That custom gate has been removed.

The editorial section now uses native cover-image loading, a small image-only reveal, and its existing independent Section Rendering API pagination/filter controller. It does not reuse or initialize Ajaxinate. Videos still need section-managed activation and pause behavior. The loader test verifies mechanics, not a measured performance improvement under every network condition.

## Imported modules

| Module | Import / dependencies |
| --- | --- |
| Editorial push | Exact current section imported. Ratio choices are the reference for product-image formats. Uses theme colors/fonts and Shopify media. |
| Editorial dispatch | Exact current section imported. Self-contained horizontal editorial navigation. A later review should cover configurable image sizes and touch scrolling. |
| Gift options | Exact current section imported. Uses Shopify cart attributes and `/cart/update.js`, with debounced/serialized updates and Dawn cart-update integration. Checkout/cart behavior was not re-tested in this import. |
| Product Group Variants | Found embedded in `main-product.liquid` with CSS in `base.css`; see the separate audit and recovered source. |

Imports preserve existing merchant configuration. Adding these files to the library does not activate them in another site's templates.

## Validation of this change

- Actual draft, Chrome desktop viewport 1440 px: gallery navigation, three images, keyboard scrollbar, native image URLs/loading, availability filtering, price sorting, reset, sticky filters and automatic pagination from 16 to 29 products.
- The page-2 editorial tile links to the same product as the next product card.
- Actual draft, Chrome mobile viewport 390 px: availability filtering, updated count/badges, drawer open/close/reset, sticky filters, visible scrollbar, hidden carets, no horizontal page overflow.
- Actual theme editor: ratio choices and requested labels/order present; Image shape and unused legacy image control absent. 3:2 measured at approximately 1.5; restored to Adapt. Temporary padding 20 px moved the gallery by 20 px and the caret by 0 px; restored to the merchant's original 0 px.
- Automated DOM tests: touch swipe/cancel and link suppression, keyboard/range navigation, filter form separation, obsolete-request cancellation, native image loading, duplicate pagination prevention and fallback link.
- Theme Check: no intrinsic component errors; dependency/translation diagnostics remain expected in this partial-theme library. Full-theme validation requires the complete integration.

These are responsive desktop-browser checks and automated gesture tests, not physical iOS/Android testing. Video/metaobject data were not newly created for this change; that earlier feature still needs validation against real merchant-provided video content.
