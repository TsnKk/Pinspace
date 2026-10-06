# Pinspace

A private visual workspace for images, reference notes, tags, and movable cards. Thai interface with multiple canvases, zoom, image uploads, text notes, metadata editing and tag filters.

## Stack
React + Vinext on Cloudflare Workers. D1 stores canvases and card metadata; R2 stores image bytes. Every read and write is scoped to the signed-in user through Sites authentication. No user content is stored in browser storage.

## Development
- Node 22.13 or newer
- Install: npm run install:ci
- Run: npm run dev
- Local sign-in: /signin-with-chatgpt?return_to=/
- Build: npm run build
- Type check: node node_modules/typescript/bin/tsc --noEmit

Generate schema migrations with npm run db:generate. After the initial build, apply pending local migrations with the Wrangler command documented in the Sites skill. Production migrations are applied by Sites publishing.

## Validation
scripts/smoke-test.mjs tests the local API: authentication, uploads, image read/delete, metadata, movement, tags, input rejection, canvas separation, and read-back.
scripts/ui-test.mjs tests local UI workflows with the bundled Playwright runtime and Edge. Its runtime path is specific to this workstation. UI test images are under ignored outputs/.

Images: JPG, PNG, WebP and GIF, up to 10 MB each. Canvas names: 100 characters. Card titles: 120 characters. Descriptions: 10,000 characters. References: 2,000 characters. Up to 20 tags per card, 40 characters per tag.

Mouse/touch: drag using the image or card header. Click a card to edit details. Keyboard: focus the card header, then use arrows to move by 10 pixels (Shift: 40); Enter opens details. Changes to details use an explicit Save button; moving cards is saved on release.

WebMCP tools list_canvases and create_canvas are feature-detected and share the same application API. Registry integration, valid creation, and invalid input were tested with a browser registry harness.
