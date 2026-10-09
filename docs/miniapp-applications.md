# Mini program application tracking

Entry: 我的 → 我的订单. Native pages: `pages/orders/index` and `pages/application-detail/index`.

The list and detail use authenticated student APIs, not the design fixture records. An account without applications sees an empty state. Status filters paginate 20 rows at a time; “进行中” includes submitted applications. Detail has progress, documents, fees, and event history. The eight progress stages follow the supplied concept. Dates, document results and fees are never inferred from the screenshot.

## Backend

Migration V19 adds application, document, fee and event tables. Existing catalogue records supply school and programme names. Only the owning student can read a student application or submit its requested documents. Only its assigned adviser can manage the application through the existing adviser session and CSRF protection.

- GET `/api/v1/miniapp/me/applications?page=0&status=IN_PROGRESS`
- GET `/api/v1/miniapp/me/applications/{id}`
- PUT `/api/v1/miniapp/me/applications/{id}/documents/{documentId}` with `filename` and `contentBase64`
- GET `/api/v1/miniapp/me/applications/{id}/documents/{documentId}` returns the private file to its owner.
- GET `/api/v1/adviser/applications` lists applications assigned to the current adviser.
- POST `/api/v1/adviser/applications` with `userId` and a published `programmeId` creates an application assigned to the current adviser.
- GET `/api/v1/adviser/applications/{id}` returns the assigned application.
- PUT `/api/v1/adviser/applications/{id}/progress` with `status`, `stage` (1–8), and `note` records progress.
- POST `/api/v1/adviser/applications/{id}/documents` with `title` and `stage` requests a document.
- PUT `/api/v1/adviser/applications/{id}/documents/{documentId}/review` with `status` (`APPROVED` or `REJECTED`) and `note` records a review.
- GET `/api/v1/adviser/applications/{id}/documents/{documentId}` retrieves the private submitted file.
- PUT `/api/v1/adviser/applications/{id}/fees/{feeId}` with `title`, `amount`, `currency`, `status` (`DUE`, `PAID`, `WAIVED`) and `stage` creates/updates a fee using a caller-generated UUID.

The adviser management UI and payment processing are not part of these student screens. Fee status is an adviser-maintained record, not a payment gateway confirmation. Application progress does not automatically advance after an upload. Completed and cancelled applications are read-only.

Uploads accept PDF, PNG and JPEG up to 1 MiB, with extension and file-signature checks. Contents are stored privately in PostgreSQL and excluded from list/detail queries. This initial bounded implementation does not perform malware scanning. Do not expose blobs through a public asset route. Add retention, malware scanning and storage lifecycle controls before expanding upload size or production document intake.

## Preview and verification

From `miniapp`, run `npx tsx scripts/preview-applications.ts` and open `.preview/applications.html`. It renders the WXML and WXSS with explicitly labelled, design-only fixtures; it is not a native WeChat simulator. Sample records are never included in runtime services.

Run `npm run check` in `miniapp`. Backend tests: `ApplicationServiceTest`, `ApplicationHttpTest`, and Docker-backed `ApplicationPersistenceIntegrationTest`.

Production use requires deploying the backend/migration, creating real application records through the adviser API, and native WeChat testing with the registered AppID. Creating these files does not deploy them.

Compatibility: the pre-existing consultation-derived `/orders` API and `order-detail` route remain available for older links. The main 我的订单 list now uses actual student application records; consultation completion does not imply admission completion. Account order totals count actual applications.
