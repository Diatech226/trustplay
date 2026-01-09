# QA checklist — Create Page

## UI & layout
- [ ] Two-column layout desktop: editor left, sidebar right.
- [ ] Sidebar sticky on desktop, single-column on mobile.
- [ ] Spacing consistent (16/24), clear section headers, no overlapping buttons.

## Editor & media
- [ ] Title/slug/content required validation.
- [ ] Headings, bold, italic, underline, lists, quotes, links work.
- [ ] Insert media opens Media Picker and inserts at cursor.
- [ ] Upload media inside editor inserts into content.

## Metadata
- [ ] Featured media can be selected from Media Picker.
- [ ] Featured media upload appears in Media Library.
- [ ] SEO fields save (title, description, OG image).
- [ ] Visibility + template saved.

## Workflow
- [ ] Save draft works.
- [ ] Publish/Update works.
- [ ] Scheduled publish with date works.
- [ ] 401 redirects to login, 403 shows AccessDenied.

## API
- [ ] POST /api/pages creates page and returns { success, data: { page } }.
- [ ] PUT /api/pages/:id updates page.
- [ ] PATCH /api/pages/:id/status updates status.
- [ ] GET /api/pages lists pages and reflects changes.
