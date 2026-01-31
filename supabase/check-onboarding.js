const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://nshgmbtvyucuwbwxhawn.supabase.co',
  'sb_secret_rkvdl0Fz3tKQ9okfxBMU9w_GhivTZud'
);

async function main() {
  const { data, count, error } = await supabase
    .from('scenes')
    .select('slug', { count: 'exact' })
    .eq('category', 'onboarding')
    .limit(5);

  console.log('Onboarding scenes count:', count);
  if (data && data.length > 0) {
    console.log('Examples:', data.map(s => s.slug));
  }
  if (error) console.log('Error:', error.message);
}

main();
