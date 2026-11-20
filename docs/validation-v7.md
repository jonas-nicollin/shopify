# Validation — component v0.7

Merchant settings, URLs, captures and store-specific findings belong in private integration records.

`npm test` covers sixteen behavioral cases, including secondary hover on/off, touch exclusion, restoring the selected slide, and preserving drawer filters while changing desktop sort. Existing cases cover Liquid navigation/media resolution, escaping, pagination, gallery controls, native image loading and filter request races.

A partial-theme run of Shopify Theme Check reports no Liquid or JSON syntax errors. Missing host assets, translations and templates remain integration dependencies; this is not a complete-theme clean bill of health.

Integration acceptance:

- Check asynchronously loaded recommendations after a fresh product-page load, including computed image dimensions, gallery controls and unique/stock badge colors.
- Check navigation below visible header regions with horizontal, vertical, drawer and disabled filters. Exercise filtering, sorting and numbered pagination; verify no horizontal document overflow at mobile widths.
- Confirm card information typography does not override badge geometry; check unique badges at the top left and independent stock/sale schemes.
- Check the breadcrumb separator, underline offset and thickness.
- Re-read installed component and host files, restore temporary merchant settings, and retain the exact source version.
- Treat browser viewport checks and simulated touch events separately from physical iOS/Android tests. Liquid video fixtures do not prove playback with a real hosted video.
