# Optional modules and host integration

Target: Dawn 15.2.0. This library is not a complete client theme. Install selected modules into a duplicate/draft, preserve merchant configuration, and record the library commit used.

| Module | Files | Host hook |
| --- | --- | --- |
| Shared product gallery | `snippets/card-product.liquid`, `product-card-gallery.liquid`, `media-aspect-ratio.liquid`, `product-badge-one-of-a-kind.liquid` | Merge the shared card with any host changes; add global settings below |
| Editorial product grid | `sections/main-collection-editorial-grid.liquid` plus shared card modules | Use one main collection grid per collection template |
| Product Group Variants | `snippets/product-group-variants.liquid` | Render from main-product's existing block case; retain its schema |
| One of a kind badge | `snippets/product-badge-one-of-a-kind.liquid` | Shared card renders it in both native badge locations |
| Header height | `assets/total-header-height-variable.js` | Load once in layout, after the body content |
| Legacy collection pagination | `assets/ajaxinate.min.js` | Existing native grid initialization and filter reinitialization; do not activate on the editorial grid |
| Editorial push / dispatch / gift options | Corresponding files under `sections/` | Optional section installation; existing data contracts remain |

## Theme settings and layout

Review the small diffs in `integrations/dawn/`; do not overwrite an entire host file from another shop. Patches are reference diffs against the inspected integration, not universal automatic installers. `base.patch` deliberately has no surrounding client identity code and may require manual application.

- `settings_schema.patch`: preserve `page_width`, extend max to 3200. Add `page_full_width` (default false), `card_gallery_enabled` and `card_gallery_scrollbar` (both default true).
- `theme.patch`: derive `--page-width` from the width/full-width setting.
- `main-collection-product-grid.patch`: add `full_width` (default false), the same visible label as Featured collection. The editorial grid already contains its own option.
- `main-product.patch`: replace the existing grouped-product block markup with its snippet render. Preserve the block schema and templates.
- `base.patch`: remove the hard-coded page-width override and the two modules' old CSS only after their snippets are installed. Leave unrelated custom CSS unchanged.

When migrating a shop already using `--page-width:100%`, set `page_full_width` to true before removing that override. Otherwise retain its previous bounded width. Merchant `settings_data.json` must never be copied from this public library. Existing `page_width`, block types, product-count ID and editor configuration remain intact.

Gallery activation now belongs to Theme settings > Product cards. The previous section `enable_card_gallery` control is retired; an unused stored value may remain in template JSON. The shared card reads the global setting first, and only uses its legacy argument when that setting is absent. Before migration, decide the global value from the shop's actual usage; this intentionally affects featured collections, native grids, search and recommendations using the shared card. Per-section image ratios remain local.

The displayed section name is **Editorial product grid**. Its technical filename remains unchanged so existing template references continue to resolve. It can operate without editorial media; separate installation remains useful for choosing modules and preserving the native grid during upgrades. Do not enable both main collection grids simultaneously (their Dawn facets use common IDs). Featured collection is a separate selection/carousel section and may coexist.

## Header-height contract

Load once: `{{ 'total-header-height-variable.js' | asset_url | script_tag }}`. It writes `--total-header-height` on the root element, summing the full heights of visible `.shopify-section-group-header-group` sections that intersect the viewport. This preserves the recovered implementation's semantics: it is not a clipped intersection measurement and it is distinct from Dawn's `--header-height`.

The script observes layout-affecting mutations and scroll/resize. A value comparison prevents its own root-style write from creating a continuous observer/animation-frame loop.

## Badge contract

The badge appears for available products whose `custom.sub_collection.value`, trimmed, equals `One of a kind`. The text, condition and existing mobile appearance are retained. The snippet owns its scoped styles and uses the theme foreground. Do not create or alter product metafields just to install it.

## Three different loading mechanisms

1. HTML `src/srcset` and `loading="lazy"`: browser-native image loading, also used by Dawn. Our late-image fade and gallery loading are custom additions kept in the section/snippet.
2. Editorial grid: its own section-rendering controller loads subsequent product pages and handles filters. This is already versioned with the section.
3. Native grid: the recovered Ajaxinate v2.0.11 script is a pre-existing customization, not native Dawn. It is archived unchanged under assets, with the upstream MIT license. Installing the script alone does not wire a new grid: retain the existing grid initialization and its facets reinitialization, or port those hooks deliberately. Do not run two pagination controllers on the same grid.

## Upgrade checklist

Duplicate the exact working theme and export a ZIP before an upgrade. Add the new Dawn version as a separate draft. Check Shopify's message about which code edits were carried over, then compare this manifest and reapply missing modules/hooks. Retain merchant settings and metaobject definitions. Validate filters, sorting, pagination, shared cards, media, grouped products, badges, header, cart and apps on desktop/mobile. Keep the old theme available; publish only when explicitly requested.

A private full-theme Git repository can improve exact diffs and rollback history, but it is optional. It does not make Dawn merges automatic. See [development method](development-method.md).
