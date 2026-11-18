"""Prepare the editorial grid in an unpacked Dawn theme. No Shopify network writes."""
import argparse
import json
import re
from pathlib import Path

PACKAGE = Path(__file__).resolve().parent
GRID = "main-collection-editorial-grid"
SCHEMA = re.compile(r"{%[- ]*schema[- ]*%}(.*?){%[- ]*endschema[- ]*%}", re.S)


def replace_once(source, old, new):
    if source.count(old) != 1:
        raise ValueError(f"Custom layout needs review near {old[:70]!r}")
    return source.replace(old, new, 1)


def fragment(reference, name):
    return reference.split("{% comment %} catalog:" + name + " {% endcomment %}\n", 1)[1].split("\n{% comment %} /catalog:" + name + " {% endcomment %}", 1)[0]


def adapt_section(source, reference):
    # Keep the merchant's section settings, facets, card arguments and surrounding markup.
    root = '<div class="section-{{ section.id }}-padding gradient color-{{ section.settings.color_scheme }}">'
    source = replace_once(source, root, fragment(reference, "root"))
    source = replace_once(source, "card_product: product,", "card_product: product,\n                    enable_card_gallery: section.settings.enable_card_gallery,\n                    desktop_columns: section.settings.columns_desktop,\n                    mobile_columns: section.settings.columns_mobile,")
    loop = r"({%-?\s*for product in collection.products\s*-?%})"
    matches = list(re.finditer(loop, source))
    if len(matches) != 1:
        raise ValueError("Cannot identify the collection loop.")
    source = source[:matches[0].start()] + fragment(reference, "setup") + "\n" + source[matches[0].start():]
    end = source.index("</li>", source.index("card_product: product,")) + len("</li>")
    source = source[:end] + "\n" + fragment(reference, "tiles") + source[end:]
    end = source.index("</ul>", end) + len("</ul>")
    stop = re.search(r"</div>\s*{%-?\s*endif\s*-?%}\s*</div>\s*</div>", source[end:])
    if not stop:
        raise ValueError("Cannot identify pagination boundary.")
    old_pager = source[end:end + stop.start()]
    if not re.search(r"paginate\.(pages|next)|infinite_next", old_pager) or re.search(r"render\s+['\x22](?!pagination['\x22])", old_pager):
        raise ValueError("Custom pagination needs review.")
    source = source[:end] + "\n" + fragment(reference, "pager") + "\n" + source[end + stop.start():]
    # The pilot owns pagination. Remove only the audited Ajaxinate initialization.
    source = re.sub(r"{{-?\s*['\x22]ajaxinate\.min\.js['\x22]\s*\|\s*asset_url\s*\|\s*script_tag\s*-?}}", "", source)
    source = re.sub(r"<script>\s*(?:const\s+endlessCollection\s*=\s*)?new Ajaxinate\(\s*\{[^{};]*\}\s*\);?\s*</script>", "", source)
    executable = re.sub(r"{%-?\s*comment\s*-?%}.*?{%-?\s*endcomment\s*-?%}", "", source, flags=re.S)
    if "new Ajaxinate" in executable or "ajaxinate.min.js" in executable:
        raise ValueError("Unrecognized Ajaxinate initializer. Review before installing.")
    match = SCHEMA.search(source)
    schema = json.loads(match.group(1))
    options = json.loads(SCHEMA.search(reference).group(1))
    ids = {"enable_card_gallery", "sticky_filters", "editorial_image"}
    if ids.intersection(s.get("id") for s in schema["settings"]):
        raise ValueError("Conflicting section setting.")
    schema["name"] = options["name"]
    schema["settings"] += [s for s in options["settings"] if s.get("id") in ids]
    return source[:match.start()] + fragment(reference, "assets") + "\n{% schema %}\n" + json.dumps(schema, ensure_ascii=False, indent=2) + "\n{% endschema %}\n" + source[match.end():].lstrip("\n")


def adapt_card(source):
    if "render 'product-card-gallery'" in source:
        return source
    match = re.search(r'<div class="media media--transparent media--hover-effect">', source)
    if not match or source.count(match.group()) != 1:
        raise ValueError("Cannot identify the existing card images.")
    remainder = source[match.start():]
    end = re.search(r"</div>(?=\s*</div>\s*{%-?\s*endif\s*-?%})", remainder)
    if not end or "card_product.featured_media" not in remainder[:end.end()] or remainder[:end.end()].count("<div") != 1:
        raise ValueError("Custom card media needs review.")
    existing = remainder[:end.end()]
    return replace_once(source, existing, HOOK + "\n" + existing + "\n{%- endif -%}")


HOOK = """{%- if enable_card_gallery and card_product.images.size > 0 -%}
  {% render 'product-card-gallery', product: card_product, lazy_load: lazy_load, desktop_columns: desktop_columns, mobile_columns: mobile_columns %}
{%- else -%}"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("theme", type=Path)
    parser.add_argument("output", type=Path, help="New directory for the three prepared theme files")
    args = parser.parse_args()
    read = lambda path: (args.theme / path).read_text(encoding="utf-8")
    ref = (PACKAGE / "sections" / (GRID + ".liquid")).read_text(encoding="utf-8")
    files = {
        "sections/" + GRID + ".liquid": adapt_section(read("sections/main-collection-product-grid.liquid"), ref),
        "snippets/product-card-gallery.liquid": (PACKAGE / "snippets/product-card-gallery.liquid").read_text(encoding="utf-8"),
        "snippets/card-product.liquid": adapt_card(read("snippets/card-product.liquid")),
    }
    args.output.mkdir(parents=True, exist_ok=False)
    for path, content in files.items():
        target = args.output / path
        target.parent.mkdir(exist_ok=True)
        target.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    main()
