# TODO - Reel generation support (NEW REEL FEATURE)

- [x] Backend: create `backend/src/routes/reelRoutes.js` (generate/upload/publish)
- [x] Backend: create `backend/src/controllers/reelController.js`
- [x] Backend: create `backend/src/services/reelGenerator.js` using Pollinations video API
- [x] Backend: create `backend/src/services/cloudinaryVideo.js` uploading with `resource_type: "video"`
- [x] Backend: create `backend/src/services/zapierVideo.js` posting payload `{type:"reel", videoUrl, caption}`
- [x] Backend: mount `/api/reel` in `backend/src/app.js`
- [x] Frontend: add `frontend/src/services/reelService.js`
- [x] Frontend: update `frontend/src/pages/DashboardPage.jsx`:
  - [x] Add Generate Type buttons [Image]/[Reel] (Image UI kept intact)
  - [x] Add “Generate Reel” button with loading text “Generating Reel...”
  - [x] Add reel preview area (video tag)
  - [x] Keep existing image publish flow disabled when Reel mode is selected

- [ ] Smoke test manually:
  - [ ] Image generation/publish flow still works
  - [ ] Reel generation -> upload -> publish works
  - [ ] Error handling works (safe message)

