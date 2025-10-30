-- Normalize unsupported challenge categories to valid ones
UPDATE challenges 
SET category = 'design' 
WHERE LOWER(category) IN ('general', 'ui', 'design-ui');

-- Ensure all categories are lowercase
UPDATE challenges 
SET category = LOWER(category) 
WHERE category != LOWER(category);
