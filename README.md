# Shopify editorial components

Reusable product grids, image galleries and collection navigation for **Dawn 15.2.0**. This repository is a component library, not a complete Shopify theme. The current version is **0.7.0**.

## Install into a draft

Install these files together, preserving existing host customizations:

- `sections/main-collection-product-grid.liquid`
- `snippets/card-product.liquid`
- `snippets/product-card-gallery.liquid`
- `snippets/media-aspect-ratio.liquid`
- `snippets/product-badge-one-of-a-kind.liquid`
- `snippets/collection-context.liquid`
- `snippets/collection-path.liquid`

Review the small host patches described in [installation](docs/installation.md) and [the v0.7 migration](docs/migration-v7.md). In particular, the gallery needs its layout asset-registration hook so recommendations loaded after the page receive its CSS and JavaScript. Installing a component does not publish the theme.

Each section contains its Liquid, schema, styles and scripts. Reusable snippets contain their own component code. Shopify compiles the stylesheet and JavaScript blocks. The grid and gallery add no third-party browser runtime.

## Product grid

One Product grid supports optional editorial image/video tiles, numbered pagination or automatic loading, horizontal/vertical/drawer filters, sorting, optional product count, configurable columns, image ratios and full-width layout.

Editorial positions follow the result order and Shopify pagination offset. Configure **Product media field** with `namespace.key` for a direct image/video file, or `namespace.key.field` for a media field in a metaobject. Empty or unsupported values fall back to the product's second image, then its featured image. Hosted Shopify videos are supported; external-video URLs and list references are not.

A dedicated navigation menu supplies one contextual row and product breadcrumbs. The row stays below visible header regions; its title scrolls away. Existing sticky-filter settings determine whether filters remain below it. On mobile, links scroll horizontally. See [the navigation contract](docs/collection-navigation.md).

## Shared product cards

Global Product cards settings enable the gallery and choose its optional Bar or Steps indicator. Each gallery shows up to three images, loading extra views on demand. It supports desktop arrows, keyboard navigation, touch swipes and range input. Secondary-image hover remains a per-section setting and works with the gallery enabled. Manual gallery selection takes priority over temporary hover.

Information text uses a common size and inherited theme typography, with spacing on `card__information`. Badge styling is independent: compact square corners, 1.2rem text, theme color schemes, and a top-left unique-item badge. Stock and sale badges keep their independent schemes. Product rating controls and rendering are removed in v0.7.

The components use Dawn's native prices, quick add, facet markup, accessible drawer, icons, translation keys and color variables. These are Dawn adapters, not a theme-independent replacement. Validate other theme versions separately.

## Optional modules

The library also includes Product breadcrumbs, Editorial push, Editorial dispatch, Gift options and Product Group Variants. Install only the modules needed by the host. Their configuration and content remain in Shopify; see [installation](docs/installation.md).

## Validation

Run `npm ci` and `npm test` with Node 18 or newer. Behavioral tests cover Liquid media/navigation resolution, breadcrumb escaping, gallery controls and hover, filter serialization and request races, native image loading and pagination fallback.

Follow [the v0.7 acceptance procedure](docs/validation-v7.md) on the actual draft at desktop and mobile widths. Browser viewport checks and simulated touch events do not replace physical-device testing. Real video playback requires a real hosted video.

Keep merchant settings, theme exports, credentials, screenshots and store-specific validation records outside this public library. Review upgrades in a separate draft; see [Dawn upgrades](docs/dawn-upgrades.md).
