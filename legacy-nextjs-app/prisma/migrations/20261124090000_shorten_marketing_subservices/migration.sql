-- Client follow-up 2026-11-24 (item 9): shorter Marketing sub-service descriptions on /services.
-- Data-only. Updates a row only if it still holds the original long default text, so any
-- wording edited in the admin panel is left alone. No-op on a database with no SubService rows.
UPDATE "SubService" SET "body" = 'Get found where your customers are searching. Our SEO, Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) services put your business on Google, AI search and voice assistants.', "updatedAt" = NOW()
WHERE "serviceKey" = 'marketing' AND "body" LIKE 'That Increase Organic Traffic & Qualified Leads Appear where customers are searching.%';

UPDATE "SubService" SET "body" = 'Social media is where customers decide whether to trust you. We build engaged communities on Instagram, LinkedIn, Facebook and YouTube through strategic content, storytelling and consistent interaction that turns followers into leads.', "updatedAt" = NOW()
WHERE "serviceKey" = 'marketing' AND "body" LIKE 'Social media is no longer just about posting content%';

UPDATE "SubService" SET "body" = 'Every successful campaign tells a story. From festive campaigns and product launches to awareness and employer branding, we build campaigns that connect emotionally and deliver measurable results.', "updatedAt" = NOW()
WHERE "serviceKey" = 'marketing' AND "body" LIKE 'Every successful campaign tells a compelling story.%';
