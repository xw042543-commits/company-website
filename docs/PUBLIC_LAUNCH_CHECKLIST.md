# Public Launch Checklist

The current target is a private preview. Do not make it public until every applicable item has an owner, evidence, and approval.

## Product and content

- [ ] Business owner approves company details, services, university data, programme data, fees, rankings, entry requirements, contact details, and both languages.
- [ ] All images, university logos, and copy have recorded usage rights.
- [ ] Empty, demo, and future-feature states accurately describe what works.

## Accounts and communication

- [x] Replace demo sessions with real authentication, secure server-side sessions, verified logout, authorization, and rate limits.
- [x] Complete account registration, password reset, email verification, and account deletion flows.
- [ ] Complete the production authentication security review and add the required audit-log retention process.
- [ ] Configure and verify production email, SMS, and WeChat providers, callback domains, templates, consent, failure handling, and vendor credentials.
- [ ] Add abuse prevention and support procedures before enabling consultation submission.

## Privacy and legal

- [ ] Approve the privacy notice, cookie policy, terms, retention schedule, consent wording, and cross-border data handling.
- [ ] Record the privacy-notice version accepted with every personal-data submission.
- [ ] Complete vendor and data-processing agreements.

## Infrastructure and security

- [ ] Configure the production domain, DNS, trusted reverse proxy, and automatic HTTPS certificate renewal.
- [ ] Store secrets in the hosting provider secret store and rotate all preview credentials.
- [ ] Restrict host firewall access; expose only HTTPS and required administration access.
- [ ] Complete dependency, container, and application security review.
- [ ] Rehearse PostgreSQL backup and isolated restore; record recovery time and recovery point results.
- [ ] Use immutable image tags and document the last known-good rollback tags.

## Monitoring and operations

- [ ] Add uptime monitoring for the public site and backend readiness.
- [ ] Centralize logs with secret and personal-data redaction.
- [ ] Add alerts for error rate, latency, disk, database, Redis, Elasticsearch, certificate expiry, and backup failures.
- [ ] Assign an incident owner and publish escalation and rollback procedures.

## Search and discoverability

- [ ] Remove private-preview `noindex` only after approval.
- [ ] Review SEO titles, descriptions, canonical URLs, language alternates, robots rules, and sitemap output.
- [ ] Verify analytics consent and exclude personal data from analytics events.

## Final release gate

- [ ] CI tests, production image builds, Compose validation, health checks, and browser smoke tests pass for the exact release commit.
- [ ] Product, engineering, operations, privacy, and business owners sign off on the same immutable release.
