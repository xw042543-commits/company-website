# Community read representations

The v1 public feed (`GET /api/v1/community/posts`), detail (`GET /api/v1/community/posts/{id}`), and personal posts (`GET /api/v1/community/me/posts`) default to their original exact field sets. They omit `title`, `category`, `universityId`, and `universityName`, including for newly created posts. This preserves installed clients with exact-key response validation.

New readers explicitly append `representation=campus-v1` to each of those requests to receive the four metadata fields. Unknown or empty representation values return `400 INVALID_COMMUNITY_REPRESENTATION`. Filters alone do not opt in. Adviser moderation keeps its existing metadata representation. Writes and comment/reply reads are unchanged.

The representation is part of the URL; all three post reads send `Cache-Control: no-store` because their responses can contain viewer-specific fields or private content. Redis hot snapshots contain IDs, not serialized representations, and can be shared between representations within the same filter scope. Cursor scope remains based on sort, category and university.

Title ingress uses 1–60 Unicode code points after line-ending normalization. Unicode whitespace, including U+FEFF, is blank; NUL, disallowed controls and unpaired surrogates are rejected. All post response DTOs use the same validation to replace invalid historical titles with `null`, preserving the body and avoiding whole-page reader failures. This does not modify stored rows or generate replacement titles.

Run the cross-language regression after the Java contract test generates server JSON:

```sh
cd backend
./mvnw -q -Dtest=CommunityPostMetadataTest,CommunityPostReaderContractTest test
cd ../miniapp
node --import tsx ../scripts/community-reader-contract.mjs
```

The runner checks the original v1 field gates, current miniapp parsers and current adviser readers against serialized server DTOs for accepted ingress titles, legacy null titles and invalid historical titles.
