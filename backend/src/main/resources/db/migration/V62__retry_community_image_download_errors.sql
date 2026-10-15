ALTER TABLE community_image_callback_inbox DROP CONSTRAINT community_image_callback_inbox_verdict_check;
ALTER TABLE community_image_callback_inbox ADD CONSTRAINT community_image_callback_inbox_verdict_check
  CHECK (verdict IN ('PASS','REVIEW','REJECTED','RETRY'));
