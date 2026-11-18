# Shopify editorial components

Reusable collection grid and product image gallery for **Dawn 15.2.0**. `main` contains the current installable files. This repository is a component library, not a complete Shopify theme.

## Installation

Copy these two files into a draft theme, using the same paths:

- `sections/main-collection-editorial-grid.liquid`
- `snippets/product-card-gallery.liquid`

In a collection template, hide the existing product grid and add **Product grid — Editorial**. Keep one collection grid active. Changes to a template affect every collection assigned to that template. Do not publish the draft before reviewing the storefront.

The section contains its Liquid, schema, CSS and JavaScript. The gallery snippet contains its own markup, CSS and JavaScript; Shopify compiles the `{% stylesheet %}` and `{% javascript %}` blocks. There are no new standalone runtime assets or third-party libraries.

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

The former collection-level `custom.editorial_tiles` mechanism is replaced by product-driven media. The legacy `editorial_image` setting ID is retained to preserve merchant configuration but is no longer used for rendering.

## Loading, filters and gallery

The section owns image activation, image decoding/reveal, filtering requests, request cancellation, history navigation, and next-page requests. The first desktop row is eager; subsequent media are activated within 500 px of the viewport. The next page is requested within 300 px of its link. A normal next-page link remains available when JavaScript is absent or automatic loading fails. The media reveal is an 800 ms opacity transition, without a positional jump, and respects reduced motion.

Filter HTML is rendered by Dawn's `facets` snippet, but its controller tags are renamed in the captured markup. This section does **not** load or invoke `facets.js` or Ajaxinate. It therefore does not inherit store-specific Ajaxinate initialization in an existing `facets.js`. It keeps Dawn's mobile drawer keyboard behavior and raises the drawer and its close control above the header while open.

The **Show product count** checkbox defaults to enabled and controls desktop and mobile counts. The **Lazy load media in this section** checkbox defaults to enabled; disabling it leaves image loading to the browser's native behavior.

The gallery displays up to three product images, with optional `custom.card_images` curation. It replaces only the native card's image area, preserving prices, badges and quick add. It loads the other images on demand, crossfades for 550 ms, and supports touch swipes and keyboard arrow keys. Dawn's `icon-caret.svg` appears on hover or keyboard focus on desktop, with no background and no visible slide counter. Touch layouts hide the arrows.

## Host theme dependencies

| Responsibility | Dependency |
| --- | --- |
| Product card content, badges, prices | Dawn `card-product` and the snippets it renders |
| Filter markup and styling | Dawn `facets`, `price-facet`, swatches and `component-facets.css` |
| Accessible mobile filter drawer | Dawn `MenuDrawer`, focus helpers and base styles from `global.js` |
| Card/grid styles, colors, typography, translations | Dawn theme assets, settings and locales |
| Icons | Dawn `icon-caret.svg`, `icon-play.svg`, `icon-pause.svg` |
| Quick add, ratings, image shapes | Corresponding Dawn assets when enabled |
| Product data, filtering, pagination and media delivery | Shopify Liquid, Section Rendering API and CDN |

The components are independent of a store's name, but are **Dawn adapters**, not a theme-agnostic standalone product-card system. Before using them on a different theme, adapt and validate those dependencies. Test a Dawn upgrade separately; do not assume another Dawn version is automatically compatible.

For a future site-wide card migration, first validate this isolated gallery in a draft, then introduce a shared card API and migrate collection grids, featured collections, search, recommendations and quick-add contexts together. Do not globally replace `card-product` as an incidental part of installing this section.

## Validation

Run `npm ci` then `npm test` (Node 18 or newer). The tests cover touch/keyboard navigation, accidental link suppression, desktop/mobile filter serialization, obsolete filter responses, lazy image activation, duplicate pagination requests and the failure fallback.

Also validate in an actual Shopify draft: desktop/mobile filter application and reset, drawer closing, counts, editorial product links, pagination across tile boundaries, image/video overrides, video pause, and gallery images. Responsive emulation and DOM tests do not replace a final physical iOS/Android swipe test.

Shopify Theme Check can parse these component files. A complete dependency/translation check must be run after installation into the target theme; this repository intentionally does not duplicate Dawn's assets, snippets and locales.

Sold-out merchandising rules are not implemented here. Shopify's native availability filter remains available where configured; changing collection-wide order or inventory inclusion is a separate decision.
