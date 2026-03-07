-- Remove all seeded/demo job data (no real company-posted jobs exist yet)
DELETE FROM "job_applications" WHERE TRUE;
DELETE FROM "jobs" WHERE TRUE;

-- Clear previously synced external jobs (will re-sync with stricter vertical filters)
DELETE FROM "external_jobs" WHERE TRUE;
