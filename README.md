# Model 3 — Inside Out

An independent interactive 3D study of a Tesla Model 3, built with Three.js.

## Explore

- Assemble and explode the vehicle layers.
- See the original interior through a roof cutaway.
- Locate the battery, supporting structure, rear drive unit, wheels and brakes inside an X-ray body.
- Follow illustrative rear-wheel-drive power flow, regenerative braking, and AC charging.
- Drive through an original 3D city with adjustable cruise speed and three camera views.

The internal geometry, energy routes, exploded offsets and vehicle motion are educational illustrations, not OEM CAD, service instructions or measured vehicle performance. Dual Motor AWD is not modeled. This project is not affiliated with Tesla.

## Run locally

Serve this folder with any static HTTP server, for example:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. No build process, backend, account or API key is required. A modern browser with WebGL is needed.

## Publish

GitHub Pages can serve the repository root from the `main` branch. The `.nojekyll` file keeps the static assets unchanged.

## Attribution

- “2024 Tesla Model 3” by **RBLXSupercars**, CC BY 4.0. See [asset credits](assets/CREDITS.md) for the source, uploader and modifications.
- Three.js: [MIT license](vendor/LICENSE-three.txt).
- Instrument Sans: [SIL Open Font License](assets/OFL-InstrumentSans.txt).

The city scenery and illustrative internal systems were made with code. Recording frames, video exports, local machine files and publishing credentials are excluded from this repository.
