# Collection navigation proposal

Status: recommendation for review, not an installed taxonomy migration. Existing product classifications, collection membership, menus and URLs are unchanged.

Keep three separate concepts: product type (necklace, bracelet, earrings), collection type (permanent range or unique piece), and model/family. A unique piece can belong to a model; it should not have to lose that family just to be marked unique.

## Proposed presentation

For a type landing page:

- Heading: Necklaces.
- Collection navigation: View all / Main collection / One of a kind.
- Model navigation: View all / Bubble / Grape / Lungo / Mini / Multi Drop / Bolo Tie / Big Drop, restricted to actual destinations in the selected branch.
- Refinement filters below: availability, price, color. Keep model/collection filters until navigation covers their actual use cases, then remove duplication deliberately in Search & Discovery.

The second navigation row need not appear when the selected branch has no model destinations. Unique pieces still have a prominent landing page and menu entry.

Example canonical breadcrumb: Home > Necklaces > Main collection > Grape. A unique-piece collection can stop at Home > Necklaces > One of a kind.

## One source for context, menus and breadcrumbs

Use one canonical Shopify navigation menu with collection resources as links, arranged Type > Collection type > Model. Select this menu once in the reusable navigation component. It resolves the current collection by its resource identity/URL, finds its branch and derives the parent links, siblings and active state automatically. Do not reproduce the link list for each collection template and do not infer parents from collection titles or handle strings.

Promotional shortcuts (New in, Shop all, unique pieces) may remain elsewhere in the main menu. They should not redefine canonical parentage. A collection appearing in several branches needs an explicit preferred branch; do not silently select an arbitrary first match. Product breadcrumbs will later require a deliberate canonical collection rule because products can belong to several collections.

Read-only observation on 20 November: the current header does not exactly follow the proposed order. It puts Main Collection before Necklaces and exposes One of a Kind as a separate shortcut. A Grape collection also currently exposes both Grape and Lungo model filter values. Navigation therefore cannot be inferred reliably from product model values alone.

Before installation, review the actual destinations and decide whether Grape and Lungo are sibling collections or a family/subfamily. Then create/rearrange the canonical menu once, map the collections and install the context component above Product grid. This is configuration work; the reusable rendering must contain no store/client names or hard-coded collection handles.
