\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE
    target_image varchar(32);
    changed integer;
BEGIN
    -- Recover only the image post reported at 15:56 MYT on 15 October 2026.
    -- A missing or ambiguous match aborts the whole transaction.
    SELECT i.id INTO STRICT target_image
    FROM community_posts p
    JOIN community_image_post_review r ON r.post_id=p.id
    JOIN community_images i ON i.post_id=p.id
    JOIN community_image_review_jobs j ON j.image_id=i.id
    WHERE p.title='11111' AND p.body='11111'
      AND p.created_at >= TIMESTAMPTZ '2026-10-15 15:55:00+08'
      AND p.created_at < TIMESTAMPTZ '2026-10-15 15:57:00+08'
      AND p.status='PENDING_REVIEW' AND p.risk_reason_code='IMAGE_REVIEW' AND p.version=0
      AND r.text_passed AND i.status='REVIEW' AND j.state='DONE' AND j.attempts=1
    FOR UPDATE OF p,i,j;

    UPDATE community_images SET status='PENDING' WHERE id=target_image AND status='REVIEW';
    GET DIAGNOSTICS changed=ROW_COUNT;
    IF changed<>1 THEN RAISE EXCEPTION 'Image retry guard failed'; END IF;

    UPDATE community_image_review_jobs
    SET state='READY',attempts=0,lease_token=NULL,trace_id=NULL,available_at=CURRENT_TIMESTAMP
    WHERE image_id=target_image AND state='DONE' AND attempts=1;
    GET DIAGNOSTICS changed=ROW_COUNT;
    IF changed<>1 THEN RAISE EXCEPTION 'Review job retry guard failed'; END IF;

    RAISE NOTICE 'Requeued exactly one image for automatic safety review';
EXCEPTION
    WHEN NO_DATA_FOUND THEN RAISE EXCEPTION 'No matching stuck image; no changes made';
    WHEN TOO_MANY_ROWS THEN RAISE EXCEPTION 'Ambiguous stuck image; no changes made';
END $$;
COMMIT;
