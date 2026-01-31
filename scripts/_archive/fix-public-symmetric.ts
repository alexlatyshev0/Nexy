import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function fix() {
  // 1. Update onboarding-public-hetero-m to be symmetric
  console.log('Updating onboarding-public-hetero-m to symmetric...');

  const { error: updateError } = await supabase
    .from('scenes')
    .update({
      slug: 'onboarding-public',
      role_direction: 'universal',
      tags: ['onboarding', 'public', 'locations'],
      user_description: {
        ru: 'Секс на кухне. Или в лесу. Или в машине.',
        en: 'Sex in the kitchen. Or in the forest. Or in the car.'
      }
    })
    .eq('slug', 'onboarding-public-hetero-m');

  if (updateError) {
    console.error('Update error:', updateError.message);
    return;
  }
  console.log('✓ Updated to onboarding-public with role_direction: universal');

  // 2. Delete onboarding-public-hetero-f
  console.log('\nDeleting onboarding-public-hetero-f...');

  const { error: deleteError } = await supabase
    .from('scenes')
    .delete()
    .eq('slug', 'onboarding-public-hetero-f');

  if (deleteError) {
    console.error('Delete error:', deleteError.message);
    return;
  }
  console.log('✓ Deleted onboarding-public-hetero-f');

  // Verify
  const { data } = await supabase
    .from('scenes')
    .select('slug, role_direction, gates_scenes, user_description')
    .eq('slug', 'onboarding-public')
    .single();

  console.log('\nResult:');
  console.log('  slug:', data?.slug);
  console.log('  role_direction:', data?.role_direction);
  console.log('  gates_scenes:', data?.gates_scenes);
  console.log('  user_description:', data?.user_description);
}

fix().catch(console.error);
