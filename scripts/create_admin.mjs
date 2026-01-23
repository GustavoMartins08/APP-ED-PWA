import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mzknvirbhibmcixmuqbq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a252aXJiaGlibWNpeG11cWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjMwNjMsImV4cCI6MjA4NDQ5OTA2M30.mBAhCA_7yh---XeoJVL7b5NkHlYZ3SQYMoyE8rWbsyw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'gmartins@empresariodigital.com.br';
    const password = 'Thaygu27*';

    console.log(`Attempting to sign up user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Gustavo Martins',
                first_name: 'Gustavo',
                last_name: 'Martins'
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    console.log('User created/fetched successfully:', data.user.id);

    if (data.session) {
        console.log('Session active.');
    } else {
        console.log('No session returned. Email confirmation might be required.');
    }

    // Attempt to check profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    if (profile) {
        console.log('Profile found:', profile);
    } else {
        console.log('Profile NOT found. Attempting to create profile manually...');
        const { error: profileError } = await supabase.from('profiles').insert([
            {
                id: data.user.id,
                email: email,
                name: 'Gustavo Martins',
                role: 'admin'
            }
        ]);
        if (profileError) {
            console.error('Error creating profile:', profileError.message);
        } else {
            console.log('Profile created successfully with ADMIN role.');
        }
    }
}

createAdmin();
