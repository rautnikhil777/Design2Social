# TODO
- [ ] Edit `frontend/src/pages/DashboardPage.jsx` only
  - [ ] Keep Publish button always rendered (remove conditional render wrapper)
  - [ ] If no image: disable publish button + show message "Generate or select an image first"
  - [ ] Replace direct Zapier fetch with `navigator.sendBeacon()` first, then fallback to `fetch(..., { mode: 'no-cors' })`
  - [ ] Ensure payload shape: { imageUrl: generatedImageUrl, caption: publishCaption }
  - [ ] Preserve existing loading states/text: Publishing..., Publish Success, Publish Failed
  - [ ] Preserve Save / Download functionality exactly
  - [ ] Reuse existing image detection logic (`generatedImageUrl`, `hasImage`, `publishCaption`)
  - [ ] Minimal code changes
