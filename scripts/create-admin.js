const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const email = 'parishkrit2061@gmail.com';
const password = 'Tokatsab1!';

async function createAdminUser() {
  console.log(`Attempting to create/update admin user: ${email}`);

  // Check if user exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    console.log('User already exists. Updating password...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: password, email_confirm: true, user_metadata: { role: 'admin' } }
    );

    if (updateError) {
      console.error('Error updating user:', updateError);
    } else {
      console.log('User password updated successfully.');
    }
  } else {
    console.log('Creating new user...');
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (createError) {
      console.error('Error creating user:', createError);
    } else {
      console.log('User created successfully with confirmed email.');
      console.log('User ID:', data.user.id);
    }
  }
}

createAdminUser();
