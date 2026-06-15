---
status: accepted
date: 2026-06-15
deciders: ["Kat (ARC)", "Dan (ARC)", "Ankit Mehta"]
tags: ["validate-image", "ui", "storage"]
---

# 0001. Remove the direct image upload option from Validate Image projects

## Context and Problem Statement

When configuring a *Validate Image* project, managers could supply imagery in
two ways, selected via a "Source type" radio control: uploading individual
images directly ("Direct Images"), or pointing at a dataset file ("Dataset
File"). The direct-image path had already been switched off in the UI behind a
`DIRECT_IMAGES_ENABLED = false` flag, because directly uploaded images consume
significant storage and the cost of that path was a concern.

That left the project form showing a "Source type" radio whose "Direct Images"
choice was permanently disabled — a visible control that did nothing. ARC, the
project stakeholders, reported that this dormant option was confusing to
managers. We needed to decide what to do with the now-disabled direct-image
path.

## Considered Options

- **Leave it disabled behind the flag** — keep the source-type radio and the
  direct-image components in place but non-functional (`DIRECT_IMAGES_ENABLED`
  stays `false`).
- **Re-enable direct image uploads** — accept the storage cost and turn the
  path back on.
- **Remove the direct-image option entirely** — delete the source-type
  selector and the direct-image code, leaving the dataset-file path as the only
  way to provide imagery.

## Decision Outcome

Chosen: **Remove the direct-image option entirely.**

ARC (Kat and Dan) asked for the option to be removed rather than left dormant,
because the disabled control was the source of the confusion. Re-enabling was
not viable: the storage-cost concern that disabled the path in the first place
is still unresolved. And leaving the control visible-but-disabled was exactly
the confusion being flagged. With only the dataset-file path remaining, the
"Source type" selector no longer has a real choice to offer, so it is removed
along with the direct-image code (see commit `46b599a`).

## Consequences

- **Good:** The project form no longer shows a disabled, unusable control,
  removing the confusion ARC reported.
- **Good:** Dead code is deleted — `DirectImagesInput`, `DirectImageAsset`, the
  "Source type" `RadioInput`, and the `ValidateImageSourceTypeEnum` wiring in
  the dashboard — which shrinks the maintenance surface.
- **Bad:** Managers lose the ability to upload images directly; every Validate
  Image project must now go through a dataset file. Restoring direct upload
  would require re-implementing the removed code (commit `46b599a` is the
  reference point).
- **Note:** This decision covers the manager dashboard only. The backend
  `ValidateImageSourceTypeEnum` is no longer queried by the dashboard but may
  still exist server-side.
- **Revisit if:** the storage-cost concern is resolved (e.g. cheaper storage,
  per-project quotas, or object-lifecycle policies) and direct uploads become
  desirable again.
