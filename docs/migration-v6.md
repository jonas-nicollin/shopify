# Migration to v0.6

Target remains Dawn 15.2.0. Keep an exact draft snapshot. This update does not publish a theme or perform the separately approved upgrade evaluation.

1. Install `collection-path.liquid` and `collection-context.liquid` in snippets; update the canonical Product grid and shared `card-product`.
2. Install Product breadcrumbs. Add it first in the footer group, with the same dedicated menu selected on the collection grids. Do not point the live header at the new menu. See [navigation configuration](collection-navigation.md).
3. Product grid replaces the fixed media mapping with one `editorial_media_path` control, default `custom.editorial_media.media`. Existing media data needs no migration. Direct image/video file references use `namespace.key`; a metaobject field uses `namespace.key.field`. Invalid/empty values retain the image fallback. List references and external-video URLs are not supported.
4. Remove `image_shape` from Product grid settings and its template instances. This removal was explicitly requested. Shared-card shape support remains for other sections such as Featured collection and recommendations.
5. Review `grid-spacing.patch`: both existing grid spacing IDs now accept zero. Preserve current values. Remove hard-coded mobile spacing overrides from the host CSS so zero works on mobile as well.
6. Review `product-card-cleanup.patch` against the actual host CSS. The shared card now owns information typography/spacing. Its conditional Liquid style block accompanies the first card (`skip_styles` false), so cards injected by product recommendations receive the styles too; no global base.css copy is needed. Remove only the obsolete custom card rules, including inactive `XXX` experiments; retain Dawn's general styles and unrelated merchant CSS. Price, caption and badge text share the card text size; font weight/style inherit the theme. Visually hidden accessibility text retains its clipping utility, and quick-add dialogs/controls retain their functional layout.

The original v0.5 migration remains valid historical documentation. Existing IDs, merchant ordering, media overrides and pagination choices are otherwise preserved. Public patches are integration examples, not a full theme export. Private snapshots and merchant configuration must remain excluded from the repository.
