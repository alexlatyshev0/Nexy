import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function fix() {
  // 1. Update onboarding-quickie-hetero-m to be symmetric
  console.log('Updating onboarding-quickie-hetero-m to symmetric...');

  const { error: updateError } = await supabase
    .from('scenes')
    .update({
      slug: 'onboarding-quickie',
      role_direction: 'universal',
      tags: ['onboarding', 'quickie'],
    })
    .eq('slug', 'onboarding-quickie-hetero-m');

  if (updateError) {
    console.error('Update error:', updateError.message);
    return;
  }
  console.log('✓ Updated to onboarding-quickie with role_direction: universal');

  // 2. Delete onboarding-quickie-hetero-f
  console.log('\nDeleting onboarding-quickie-hetero-f...');

  const { error: deleteError } = await supabase
    .from('scenes')
    .delete()
    .eq('slug', 'onboarding-quickie-hetero-f');

  if (deleteError) {
    console.error('Delete error:', deleteError.message);
    return;
  }
  console.log('✓ Deleted onboarding-quickie-hetero-f');

  // Verify
  const { data } = await supabase
    .from('scenes')
    .select('slug, role_direction, gates_scenes')
    .eq('slug', 'onboarding-quickie')
    .single();

  console.log('\nResult:');
  console.log('  slug:', data?.slug);
  console.log('  role_direction:', data?.role_direction);
  console.log('  gates_scenes:', data?.gates_scenes);
}

fix().catch(console.error);
