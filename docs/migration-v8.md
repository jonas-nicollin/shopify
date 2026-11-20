# v0.8 migration — collection navigation and cart preferences

Target: Dawn 15.2.0. Preserve the exact current draft files before installation. Keep merchant settings, backups and validation evidence private.

## Files

Replace `snippets/collection-context.liquid`, `sections/main-collection-product-grid.liquid` and, when installed, `sections/gift-options.liquid`. Add `snippets/currency-label.liquid` and merge `integrations/dawn/currency-label.patch` into the host's country picker. Existing setting IDs and template choices remain unchanged.

## Navigation and grid

- A root with no child links retains its heading and omits the redundant View all row.
- Overflow navigation shows directional buttons with theme-colored gradients. Buttons disappear at either end; keyboard focus moves to the revealed end link if its button disappears. Reduced-motion preferences are respected.
- Navigation links use the normal page width even when products and facets use full width. Link bottom padding is 1rem.
- The catalog creates its own stacking context below host header drawers. An open facet drawer raises its section and facet layer above the navigation.
- Sticky navigation and the configured sticky facets are eligible only when the rendered grid is taller than the available viewport below the visible header, navigation and horizontal facet bar. Measurements update on resize, section replacement and grid changes. Pagination controls are not counted as products.
- Vertical facets reserve a separate column, adapt their form to its width and show the product count. Filter, sort and reset interactions preserve an explicit alternate-template `view` parameter.

Host requirements remain Dawn's header selectors, facet markup, drawer behavior, page-width and color variables. Revalidate integrations that change those structures.

## Packaging preference

The optional Gift options section adds an unchecked “Use fewer boxes” choice after its gift fields. It appears for at least two shippable, non-gift-card units, including multiple units of the same item. Three new text settings customize the label and explanations; existing gift settings are preserved.

The cart/order attribute `Packaging preference` contains `Fewer boxes` when selected, or an empty value otherwise. Gift orders clear and disable it. Cart quantity events recalculate eligibility and clear obsolete choices. Writes share the existing serialized gift-save queue and standard cart-submit guard.

This records a packing instruction. It does not calculate box quantities, discounts or fulfillment actions. Confirm the wording and packing workflow with the merchant before publishing. Dawn accelerated checkout behavior is a host dependency; validate supported accelerated paths separately.

## Currency labels

The shared label outputs the ISO code and, only when different, its symbol: `CHF`, `USD $`, `EUR €`. The country-picker patch updates its current selection, popular-country list and full-country list. It affects every host caller of that picker without changing market or currency settings.

## Acceptance

Run `npm test`. On the actual draft, verify an empty navigation, overflowing links, header/facet drawers, small and tall grids, bounded and full-width vertical layouts, desktop/mobile filtering and sorting, and pagination. Test packaging persistence, gift exclusivity, quantity changes and failed-save recovery. Verify currency labels in header, mobile menu and footer. Browser emulation is not physical-device validation.
