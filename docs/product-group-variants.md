# Product Group Variants — recovered source and analysis

Recovered from the actual draft on 19 November 2026. This is an archive of the existing implementation, not a newly validated installable snippet. The live product block and its CSS have not been modified by this import.

## What it does

The `product_group_variants` block lives in `sections/main-product.liquid` (around lines 108–160; schema around line 830). Styles live in `assets/base.css` around lines 142–230.

`product.metafields.custom.product_group` points to a Product Group metaobject. Its `products` list is the membership/order source; `sort` may request alphabetical order and `display` selects image output. The block has a text setting `label`, default `Colors`.

Each item navigates to a separate product URL. These are grouped products, not variants of the currently viewed product: stock, prices and product URLs stay separate. This is appropriate when each color/design needs its own product page. It is not a replacement for Shopify variants when options belong to one product.

The current draft was inspected on a product with four group members: all four images and links rendered, and the current product was marked active. This does not establish behavior for empty groups or missing images.

## Recommended extraction

Use `snippets/product-group-variants.liquid` for the markup and scoped styles, then keep only a short render call in the native product section's block case. Preserve the block type, `label` setting ID and metafield contract so current templates continue to work. Move the existing CSS out of base.css only in the same migration, after checking the product page at desktop and mobile widths.

Before that migration:

1. Always provide a product-title accessible label and a visible text fallback if the image is missing or display mode is not Image. The current conditional can produce empty links.
2. Use explicit `.value` for metaobject fields (`group.sort.value`, `group.display.value`, `group.products.value`) instead of relying on field-drop coercion. The current image mode rendered in the tested group; this is a robustness improvement, not a claim that every current group is broken.
3. Validate the resolved products list, preserve its manual order unless alphabetical sorting is selected, and tolerate unresolved product references.
4. Align HTML image dimensions with the actual 60 px thumbnail display and keep an appropriate source resolution for high-density screens.
5. Prefer `aria-current="page"` for the current product; expose the name on keyboard focus as well as hover. The existing hover-only CSS tooltip can duplicate an image's accessible name in some browsers.
6. Make presentation options explicit without introducing shop names into classes. Keep product grouping and image-gallery behavior as separate optional modules.

No store-wide variant migration or new metaobject definitions were performed here.

Reference: [Shopify Liquid metaobjects](https://shopify.dev/docs/api/liquid/objects/metaobject).

## Existing Liquid block (unchanged source)

```liquid
{%- when 'product_group_variants' -%}
  {% assign group = product.metafields.custom.product_group.value %}

  {% if group and group.products != blank %}
    <div class="product-group-variants" {{ block.shopify_attributes }}>
      <p class="product-group-variants__label">
        {{ block.settings.label | default: 'Colors' }}
      </p>

      <ul class="product-group-variants__list" role="list">
        {% assign products = group.products.value %}

        {% if group.sort == 'Alphabetical' %}
          {% assign products = products | sort: 'title' %}
        {% endif %}

        {% for p in products %}
          <li class="product-group-variants__item">
            <a
              href="{{ p.url }}"
              class="product-group-variants__link {% if p.id == product.id %}is-active{% endif %}"
              aria-current="{% if p.id == product.id %}true{% else %}false{% endif %}"
              data-label="{{ p.title | escape }}"
            >
              {% if group.display == 'Image' and p.featured_image %}
                <img
                  src="{{ p.featured_image | image_url: width: 120 }}"
                  alt="{{ p.featured_image.alt | default: p.title | escape }}"
                  loading="lazy"
                  width="48"
                  height="48"
                >
              {% endif %}
            </a>
          </li>
        {% endfor %}
      </ul>
    </div>
  {% endif %}
```

## Existing CSS (unchanged source)

```css
/* ============================================================
   PRODUCT GROUP VARIANTS – Base styling
   ============================================================ */

.product-group-variants {
  /* margin: 1rem 0; */
}

.product-group-variants__label {
  font-size: 1.2rem;
}

.product-group-variants__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.product-group-variants__item {
  margin: 0;
}

.product-group-variants__link {
  display: block;
  border: 1px solid transparent;
  padding: 2px;
  transition: border-color 0.2s ease;
}

.product-group-variants__link img {
  display: block;
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.product-group-variants__link:hover,
.product-group-variants__link.is-active {
  border-color: rgb(var(--color-foreground));
}

/* Ajoute une animation au hover 
.product-group-variants__link img {
  transition: opacity 0.2s ease;
}

.product-group-variants__link:hover img {
  opacity: 0.7;
}

.product-group-variants__link.is-active img {
  opacity: 1;
}
*/

.product-group-variants__link:focus-visible {
  outline: 2px solid rgb(var(--color-foreground));
  outline-offset: 2px;
}


.product-group-variants__link {
  position: relative;
}

.product-group-variants__link::after {
  content: attr(data-label);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgb(var(--color-background));
  color: rgb(var(--color-foreground));
  padding: 4px 6px;
  font-size: 1.2rem;
  line-height: 1;
  white-space: nowrap;
  /* border: 1px solid rgb(var(--color-foreground)); */
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 2;
}

.product-group-variants__link:hover::after {
  opacity: 1;
}
```
