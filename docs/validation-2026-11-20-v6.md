# Validation — component v0.6

Target compatibility: Dawn 15.2.0. Merchant configuration, screenshots and store-specific validation records stay outside this public library.

## Automated checks

`npm test` passes fourteen behavioral cases covering Liquid navigation and media resolution, breadcrumb selection and escaping, plus gallery, filter and pagination regressions. Three-level menu fixtures verify one flattened row and complete breadcrumb ancestors. Media fixtures cover direct image/video references, metaobject references, invalid paths and image fallback.

Official Shopify Theme Check on a partial integration reports no Liquid or schema syntax errors. Missing host dependencies and host warnings require a separate complete-theme check; this component library does not constitute a complete theme.

## Integration acceptance procedure

1. Check type, group and model collections: View all must target the type collection, and only the actual destination is marked current. Confirm that all links remain reachable in one horizontal mobile row.
2. Check product arrival directly and with collection context, including multiple collection membership and an explicit breadcrumb override. Confirm placement below recommendations and above the footer.
3. Exercise numbered pagination, automatic loading, filtering, sorting and browser history at desktop and mobile widths.
4. Test zero horizontal and vertical gaps, including any host mobile CSS overrides. Restore temporary merchant settings after testing.
5. Inspect card text and spacing in the grid, Featured collection and asynchronously loaded recommendations. The card's conditional style must accompany the first rendered card so AJAX callers receive it.
6. Test a real image and hosted-video product override, empty-field fallback, autoplay off and reduced motion. Liquid fixtures do not establish actual video playback compatibility.
7. Validate swipe and indicator dragging on physical iOS and Android devices. Browser emulation and simulated events do not replace physical-device acceptance.
8. Compare installed files with the reviewed library and retain the integration record privately. Keep theme upgrade validation in a separate draft.
