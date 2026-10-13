# Exact submitted image URL diagnostics

Temporarily set `APP_COMMUNITY_IMAGES_REVIEW_DIAGNOSTICS_ENABLED=true` in the production environment file and rebuild/recreate the backend with the updated Compose file. The default is false. Turn it off and recreate the backend after investigation.

For each new submission the backend probes the **same URI** serialized as `media_url`, before submitting to WeChat. It checks the URL shape and local signature, then performs a credential-free GET. The configured HTTP client does not follow redirects; connection/read timeouts remain 3/5 seconds. It reads only three bytes, not a complete download or image decode. The diagnostic request adds latency while enabled but never grants publication or prevents the normal provider submission on a download failure.

Logs contain only a media URL hash, booleans, status, declared length and exception class. No URL, signature, openid, token, response body or exception message is logged. Match `mediaHash` in `probe` and `submitted`, then match `traceHash` in `submitted` and `callback`.

`httpStatus=200 jpegType=true jpegPrefix=true` confirms the application's own network path can read a JPEG prefix at the actual submitted URI. It does **not** establish that WeChat can download it, nor verify complete image integrity. A missing Content-Length is represented by -1 and alone does not prove a failure. The diagnostic GET itself creates a Caddy access entry: do not misidentify that entry as WeChat traffic.

If the probe succeeds and WeChat still reports -1008 without a separate media request, investigate the provider's network/TLS/DNS path and request official support using the original trace ID through a private channel. Do not publish signed URLs or secrets. Existing REVIEW posts are not automatically resubmitted by this diagnostic.
