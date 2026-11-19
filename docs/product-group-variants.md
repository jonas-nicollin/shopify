# Product Group Variants

The module is now `snippets/product-group-variants.liquid`, with its own scoped styles. The native product section retains the existing `product_group_variants` block type and `label` setting; its block case renders the snippet. Remove the old base.css styles in the same migration.

## Contract and behavior

- `product.metafields.custom.product_group.value` references a metaobject.
- `products.value` is the list of separate products, in merchant order; `sort.value == 'Alphabetical'` sorts by title.
- `display.value == 'Image'` shows 60 × 60 px thumbnails, with 60/120/180 px responsive sources. Other modes and products without images show visible product-title links.
- Unresolved references are skipped. Empty groups produce no wrapper.
- Links always have an escaped product-title accessible name; the current product uses `aria-current="page"`. Names appear on hover and keyboard focus for thumbnails.
- Colors use the active theme color scheme; no JavaScript is required.

This is product-to-product navigation, not Shopify variants: inventory, prices and URLs remain separate. No product data or metaobject definitions are changed by the extraction.

Install using [the host integration guide](installation.md). The original implementation below is preserved only as historical migration context; it is no longer the installable source.

Reference: [Shopify Liquid metaobjects](https://shopify.dev/docs/api/liquid/objects/metaobject).

## Installing on another Dawn theme

Add this block definition to the main-product schema only when it is absent:

```json
{
  "type": "product_group_variants",
  "name": "Product group variants",
  "settings": [
    {
      "type": "text",
      "id": "label",
      "label": "Label",
      "default": "Colors"
    }
  ]
}
```

Add the corresponding case inside the product block loop:

```liquid
{%- when 'product_group_variants' -%}
  {% render 'product-group-variants', product: product, block: block %}
```

Then add the block in the product template using the theme editor. Create or map the documented metaobject fields in that shop; theme files do not transfer their definitions or content.

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
