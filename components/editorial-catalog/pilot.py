"""Prepare or install the editorial grid on a single unpublished Shopify theme."""
import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

PACKAGE = Path(__file__).resolve().parent


def check_draft(store, theme):
    raw = subprocess.check_output(["shopify", "theme", "list", "--store", store, "--json"], text=True)
    entries = json.loads(raw)
    draft = next((item for item in entries if str(item["id"]) == theme), None)
    if not draft or draft["role"] != "unpublished":
        raise SystemExit("Select a theme whose role is unpublished.")
    print("Draft:", draft["name"], theme, flush=True)


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("store")
    parser.add_argument("theme")
    parser.add_argument("template")
    parser.add_argument("--install", action="store_true")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*\.myshopify\.com", args.store) or not args.theme.isdigit():
        parser.error("Expected a myshopify.com domain and numeric theme ID.")
    if not re.fullmatch(r"collection(?:\.[a-zA-Z0-9_-]+)?\.json", args.template):
        parser.error("Expected a collection template filename.")
    check_draft(args.store, args.theme)
    template = "templates/" + args.template
    options = ["--store", args.store, "--theme", args.theme]
    work = Path(tempfile.mkdtemp(prefix="catalog-pilot-", dir=".")).resolve()
    original, output = work / "original", work / "prepared"
    original.mkdir()
    print("Local backup:", original, flush=True)
    paths = ["snippets/card-product.liquid", "sections/main-collection-product-grid.liquid", template,
             "sections/main-collection-editorial-grid.liquid", "snippets/product-card-gallery.liquid"]
    subprocess.run(["shopify", "theme", "pull", *options, "--path", str(original),
                    *[arg for p in [*paths, "layout/theme.liquid"] for arg in ("--only", p)]], check=True)
    subprocess.run([sys.executable, str(PACKAGE / "prepare.py"), str(original), str(output)], check=True)
    current = (original / template).read_text(encoding="utf-8")
    revised, count = re.subn(r'("type"\s*:\s*)"main-collection-product-grid"', r'\1"main-collection-editorial-grid"', current)
    if count != 1 and (count or '"main-collection-editorial-grid"' not in current):
        raise SystemExit("Cannot identify a unique product grid in this template.")
    (output / "templates").mkdir()
    (output / template).write_text(revised, encoding="utf-8")
    print("Prepared files:", output, flush=True)
    if args.install:
        (output / "layout").mkdir()
        shutil.copy2(original / "layout/theme.liquid", output / "layout/theme.liquid")
        check_draft(args.store, args.theme)
        destinations = [template, paths[0], *paths[3:]]
        subprocess.run(["shopify", "theme", "push", *options, "--nodelete", "--path", str(output),
                        *[arg for p in destinations for arg in ("--only", p)]], check=True)


if __name__ == "__main__":
    run()
