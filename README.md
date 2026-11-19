# Shopify editorial components

Reusable collection grid and product image gallery for **Dawn 15.2.0**. `main` contains the current installable files. This repository is a component library, not a complete Shopify theme.

## Installation

Install these five files together into a draft theme, using the same paths. Review the existing shared card before replacing it, preserving any host customizations:

- `sections/main-collection-editorial-grid.liquid`
- `snippets/product-card-gallery.liquid`
- `snippets/card-product.liquid`
- `snippets/media-aspect-ratio.liquid`
- `snippets/product-badge-one-of-a-kind.liquid`

In a collection template, hide the existing product grid and add **Editorial product grid**. Keep one collection grid active. Changes to a template affect every collection assigned to that template. Do not publish the draft before reviewing the storefront.

The section contains its Liquid, schema, CSS and JavaScript. The gallery snippet contains its own markup, CSS and JavaScript; Shopify compiles the `{% stylesheet %}` and `{% javascript %}` blocks. The grid/gallery add no third-party runtime. Optional header-height and legacy Ajaxinate assets are documented separately.

## Editorial media

The default interval is **16 products**: insert a media tile immediately before products 17, 33, 49, etc. The tile links to that following product. Positions use Shopify's pagination offset, so loading another page does not restart the cadence. Filtering and sorting use the order of the current result set.

Media priority:

1. The product's optional metaobject reference, described below, if its `media` field is an image or a Shopify-hosted video.
2. The product's second image.
3. Its featured image when no second image exists.

A product without suitable media produces no editorial tile. On desktop the large tiles alternate left/right, spanning two columns and two rows (the reference layout uses four columns). Below 990 px they occupy a full row at a 4:3 ratio. Cropping follows Shopify image focal points. The interval and desktop/mobile column counts are configurable.

### Product override setup

Create a metaobject definition `editorial_media`:

| Field key | Type | Purpose |
| --- | --- | --- |
| `media` | One file reference, media files only | Image or Shopify-hosted video |
| `alt` | Single line text, optional | Accessible image description |

Create the product metafield `custom.editorial_media`, type **one metaobject reference**, restricted to that definition. Make the entries available to the storefront and set them **Active**. Select an entry from the product's **Editorial media** field. An empty reference automatically restores the product-image fallback.

The namespace, metafield key and metaobject media-field key are editable in the section, allowing another shop's existing data model to be used. Definitions and entries belong to the shop and are not transferred by copying theme files.

Videos load near the viewport, play muted and inline, loop, and pause outside the viewport. A visible play/pause control remains available. Autoplay can be disabled in section settings and is suppressed for `prefers-reduced-motion`. External YouTube/Vimeo URLs are not accepted by this version.

The former collection-level `custom.editorial_tiles` mechanism is replaced by product-driven media. The unused `editorial_image` setting and the section's `image_shape` setting were explicitly removed in November 2026. Old template JSON may still contain these unused keys until Shopify saves it; no product or media files are deleted. Shape support remains in the shared Dawn card for other sections.

## Loading, filters and gallery

Images use Dawn's browser-native loading approach: real `src` and `srcset` in HTML, the first desktop row eager, and subsequent covers marked `loading="lazy"`. The browser controls when to request those images. The section adds a 650 ms opacity animation only when an image finishes loading later; cached images and product text remain visible immediately. Reduced motion disables the animation. Disabling **Lazy load media in this section** makes cover/editorial images eager.

Video activation remains section-owned within 500 px of the viewport. The section also owns filtering requests, cancellation, history navigation and next-page requests. The next page is requested within 300 px of its link. A normal next-page link remains available without JavaScript or after an automatic-loading failure. Image loading and page pagination are separate mechanisms.

Filter HTML is rendered by Dawn's `facets` snippet, but its controller tags are renamed in the captured markup. This section does **not** load or invoke `facets.js` or Ajaxinate. It therefore does not inherit store-specific Ajaxinate initialization in an existing `facets.js`. It keeps Dawn's mobile drawer keyboard behavior and raises the drawer and its close control above the header while open.

The **Enable product count** checkbox defaults to enabled and controls desktop and mobile counts. It retains the `show_product_count` setting ID and sits directly below **Enable sorting**. **Enable editorial media** retains the `enable_editorial` ID.

The gallery displays up to three product images, with optional `custom.card_images` curation. Dawn's shared `card-product` renders it directly when **Theme settings > Product cards > Enable card gallery** is enabled, preserving prices, badges and quick add. This applies to every caller of the shared card. The legacy render argument is only a fallback when the global setting has not been installed. There is no client-side replacement of native card markup.

Extra images load on demand, crossfade for 550 ms, and support touch swipes and keyboard arrow keys. Dawn's small `icon-caret.svg` appears on hover or keyboard focus on desktop, with no background and no visible slide counter. The buttons sit directly inside `card__media`, before the gallery, with 44 px targets; global image padding is applied to the image rather than the controls. Touch layouts hide the arrows. A thin range-based scrollbar supports dragging and keyboard input, appears on hover/focus on desktop and appears for 1.4 seconds after touch interaction on mobile. Only the active segment is colored, using the theme foreground; the remaining track is transparent. **Enable gallery scrollbar** is a separate global checkbox. No Swiper library is required.

Image ratios belong to each section because cropping depends on its content. Global theme settings continue to control card style, spacing, border, color and typography. The ordered formats match Editorial push: **1:1, 3:2, 2:3, 4:3, 3:4, 5:4, 4:5, 16:9, 9:16**, preceded by **Adapt to image**. Existing `square` and `portrait` values remain compatible. Viewport-height presets from Editorial push are intentionally not card ratios.

## Host theme dependencies

| Responsibility | Dependency |
| --- | --- |
| Product card content, badges, prices | Dawn `card-product` and the snippets it renders |
| Filter markup and styling | Dawn `facets`, `price-facet`, swatches and `component-facets.css` |
| Accessible mobile filter drawer | Dawn `MenuDrawer`, focus helpers and base styles from `global.js` |
| Card/grid styles, colors, typography, translations | Dawn theme assets, settings and locales |
| Icons | Dawn `icon-caret.svg`, `icon-play.svg`, `icon-pause.svg` |
| Quick add and ratings | Corresponding Dawn assets when enabled |
| Product data, filtering, pagination and media delivery | Shopify Liquid, Section Rendering API and CDN |

The components are independent of a store's name, but are **Dawn adapters**, not a theme-agnostic standalone product-card system. Before using them on a different theme, adapt and validate those dependencies. Test a Dawn upgrade separately; do not assume another Dawn version is automatically compatible.

The agreed architecture uses a **shared card plus optional editorial grid**. Gallery and scrollbar activation are global, with regression checks for shared-card consumers. Complete independence from Dawn would require owning its price, badge, quick-add, facet and drawer contracts. That is not the present objective: this library deliberately extends Dawn and documents the dependencies.

## Other modules and working method

The current draft versions of `editorial-push.liquid`, `editorial-dispatch.liquid` and `gift-options.liquid` are included unchanged. They are optional modules, not automatically activated by installing the grid. Their data and merchant settings remain in the shop.

See [installation and host hooks](docs/installation.md), [development method](docs/development-method.md), [theme customization audit](docs/theme-audit-2026-11-19.md) and [Product Group Variants audit and recovered source](docs/product-group-variants.md). This public library is not a full client-theme backup. A private complete-theme repository is optional: Shopify plus exact draft backups and a record of installed component versions is a valid simpler workflow.

## Validation

Run `npm ci` then `npm test` (Node 18 or newer). The tests cover touch/keyboard/range navigation, accidental link suppression, desktop/mobile filter serialization, obsolete filter responses, preservation of native image loading, duplicate pagination requests and the failure fallback.

Also validate in an actual Shopify draft: desktop/mobile filter application and reset, drawer closing, counts, editorial product links, pagination across tile boundaries, image/video overrides, video pause, and gallery images. Responsive emulation and DOM tests do not replace a final physical iOS/Android swipe test.

Shopify Theme Check can parse these component files. A complete dependency/translation check must be run after installation into the target theme; this repository intentionally does not duplicate Dawn's assets, snippets and locales.

Sold-out merchandising rules are not implemented here. Shopify's native availability filter remains available where configured; changing collection-wide order or inventory inclusion is a separate decision.

Global Layout supports fixed widths up to **3200 px** and **Enable full-width layout**. The native and editorial collection grids each offer **Make products full width**, independently of the global width; Featured collection retains its existing option. Apply the host patches described in the installation guide.
