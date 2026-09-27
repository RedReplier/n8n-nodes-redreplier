# Changelog

## 0.3.0

- Array filters (statuses, sources, keywords) are sent as repeated query keys, so the API applies them. Before, they were ignored, including the trigger's NEW status filter.
- The trigger asks for mentions ingested since its last poll, with a one hour overlap, so mentions found late for older posts are no longer missed.
- Website Update can set a description and no longer clears the name when Name is left empty.
- Website Create takes a Description and an Analyze Website toggle to skip the paid analysis.
- Keyword Delete warns that it also deletes the keyword's mentions.
- From and To describe what they filter: when RedReplier found the mention.
- The credential test calls `GET /workspaces`.

## 0.2.0

- Mention Get Many and Count take a Minimum Relevance Score filter.
- The trigger asks the API for mentions at or above its minimum score, so a page of low scores no longer hides the ones you want.

## 0.1.1

- First release published from GitHub Actions with npm provenance.

## 0.1.0

- Initial release.
