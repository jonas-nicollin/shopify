# Collection navigation and product breadcrumbs

Implemented in v0.6 for Dawn 15.2.0. Product type, collection type and model remain separate product data. Their display does not require three stacked navigation rows.

## One menu, one visible row

Create a separate Shopify menu named **Collection navigation**. Do not edit or replace the published header menu. Make each type a root link. Add shortcuts as children and group model links under their collection-type child. The current integration uses a type heading, View all, two existing shortcuts, and eight model destinations: eleven links total, matching the reference. Existing sibling relationships and URLs are preserved; no collections or product memberships are changed.

Select this menu in **Product grid > Filtering and sorting > Navigation menu** on each collection template. The component finds the current collection by its URL/resource handle and renders its type row. It does not infer hierarchy from a collection's name. Three-level menus are supported: children with their own children are flattened into model links in the same row. Group headings remain ancestors in breadcrumbs, without adding another row. View all points to the root type collection, not its permanent-only subset. On smaller screens the row scrolls horizontally; it never wraps into several navigation levels. All links remain accessible rather than silently truncating a longer merchant menu.

An unmatched collection renders no contextual navigation. Filters remain separate and are not automatically removed from Search & Discovery. Choosing another collection follows its URL and starts a fresh result set. Filter/sort updates keep the current navigation. The existing collection banner and other merchandising sections are not removed.

## Product breadcrumbs

Install `sections/product-breadcrumbs.liquid` and the two shared snippets. Add Product breadcrumbs as the first section in the **footer group**, selecting the same menu. It renders only on product pages, below all product-template sections (including recommendations) and above the footer. The menu content is maintained once; both section controls point to that same resource.

The breadcrumb contains the shop name, menu ancestors and the product title. Links are underlined; separators are hyphens; the current product is unlinked and marked `aria-current="page"`. Colors come from the theme. If the product has no matching menu collection, the breadcrumb falls back to shop → product.

For a product in several collections, selection priority is:

1. Optional product metafield `custom.breadcrumb_collection`, a single collection reference. Create its definition if manual canonical overrides are needed, and choose a collection present in the navigation menu.
2. An explicit collection context in the product URL, when present in the menu.
3. Among the product's collections represented in the menu, choose the one with the fewest **total** products, not the filtered/available count. This is a practical specificity fallback, not a claim that Shopify provides collection parentage. Menu order resolves equal counts. A promotional collection can also win if it is smaller; use the explicit field for exceptions. Recheck canonical paths if collection memberships change substantially.

This selects a narrower sibling family when a product is included in both a broader family and its specific collection. The live integration was checked with a product belonging to both Grape and Lungo Grape: the direct product URL resolves to Lungo Grape. These are sibling menu entries, as requested, not a new parent/subfamily taxonomy.

No browser history, referrer, local storage or client-specific names are needed. Rendered links and titles are escaped. Liquid does the work on the server, including without JavaScript.
