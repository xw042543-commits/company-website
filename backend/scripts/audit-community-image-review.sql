\pset pager off
\echo 'Reported image post review outcome (statuses only)'
SELECT p.status AS post_status, i.status AS image_status, j.state AS job_state,
       j.attempts, j.direct_fallback, r.text_passed
FROM community_posts p
JOIN community_image_post_review r ON r.post_id=p.id
JOIN community_images i ON i.post_id=p.id
JOIN community_image_review_jobs j ON j.image_id=i.id
WHERE p.title='11111' AND p.body='11111'
  AND p.created_at >= TIMESTAMPTZ '2026-10-15 15:55:00+08'
  AND p.created_at < TIMESTAMPTZ '2026-10-15 15:57:00+08';
\echo 'Recent community image review states (last two hours; aggregate counts only)'
SELECT p.status AS post_status,
       COALESCE(p.risk_reason_code, 'NONE') AS reason,
       COALESCE(r.text_passed::text, 'NONE') AS text_passed,
       i.status AS image_status,
       COALESCE(j.state, 'NONE') AS job_state,
       count(*) AS image_count,
       max(round(extract(epoch FROM (CURRENT_TIMESTAMP - p.created_at)) / 60)) AS oldest_age_minutes
FROM community_posts p
JOIN community_images i ON i.post_id = p.id
LEFT JOIN community_image_post_review r ON r.post_id = p.id
LEFT JOIN community_image_review_jobs j ON j.image_id = i.id
WHERE p.created_at >= CURRENT_TIMESTAMP - INTERVAL '2 hours'
GROUP BY p.status, p.risk_reason_code, r.text_passed, i.status, j.state
ORDER BY p.status, reason, image_status, job_state;

\echo 'Recent callback counts (last two hours; aggregate only)'
SELECT verdict, count(*) AS callback_count
FROM community_image_callback_inbox
WHERE received_at >= CURRENT_TIMESTAMP - INTERVAL '2 hours'
GROUP BY verdict
ORDER BY verdict;
