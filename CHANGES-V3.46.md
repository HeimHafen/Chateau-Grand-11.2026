# V3.46 – Grand Escalier: Einrichtung nach Bildreferenz

V3.45 remains the architectural baseline. Original procedural furniture is installed in the Grand Escalier, its connected rear Antichambre and the upper landing/adjacent gallery area. The central historic Vestibule and all other architecture remain unchanged. The U-shaped stair and measured room axes do not reproduce the generated single-view reference literally; the arrangement has been adapted to preserve circulation.

- Gilt settee with cream damask and blue cushions, two side tables with porcelain lamps, three consoles with marble-like tops, curved legs and scrollwork, upholstered bench and draped cloth.
- Modelled vases, flowers, urns, books, a stylised bronze horse and a classical stylised bust on a pedestal.
- Two gilded landscape frames and gilded mirror; mirror uses metallic environment reflection rather than a separate real-time planar mirror.
- Low-profile 3.25 × 4.10 m rug with fringe. The rug and painting textures were rectified from the supplied generated reference. The damask texture is original. No external museum images or models are packaged.
- 14 furnishing groups; 10 solid collision bounds; 271742 added triangles. Two new local table-lamp light sources. Prior chandelier fixtures unchanged.

## Design references (visual research, no downloaded assets)
- The Metropolitan Museum of Art, French console table (carved and gilded oak, marble top): https://www.metmuseum.org/art/collection/search/236089
- The Metropolitan Museum of Art, Georges Jacob, Small settee (Marquise): https://www.metmuseum.org/art/collection/search/202143
- The Metropolitan Museum of Art, Savonnerie Manufactory, Carpet (tapis): https://www.metmuseum.org/art/collection/search/206502

## Tests
`node --experimental-default-type=module tests/validate-furnishings-v346.mjs`: 464 furniture/wall checks, 8 upper-deck corner checks, no masonry collision. `audit-complete-v341.mjs --skip-roof`: 38 accessible room zones, 909 floor/headroom samples, no failures. `validate-stair-v310.mjs`: 1,020 movement steps. `validate-interior-doors-v330.mjs`: 2,924 movement steps, 43 doors, no blocked test paths. Browser render started for the earlier furniture iteration; final visual appearance and iPhone performance not verified. Roof-ray test omitted in this release. Stylised models are not original scanned museum objects and not pixel-identical to the target.
