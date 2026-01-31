-- Check for scenes with similar titles
SELECT 
  title->>'ru' as title_ru,
  COUNT(*) as count,
  array_agg(slug) as slugs
FROM scenes 
WHERE version = 2 AND is_active = true
GROUP BY title->>'ru'
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;
