// Tenant Registration API
// /app/api/tenant/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/client';

// POST /api/tenant/register - Self-service tenant registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organization_name, 
      admin_email, 
      admin_name, 
      admin_password,
      industry, 
      company_size, 
      requested_plan = 'starter' 
    } = body;

    // Validate required fields
    if (!organization_name || !admin_email || !admin_name || !admin_password) {
      return NextResponse.json({ 
        error: 'Missing required fields: organization_name, admin_email, admin_name, admin_password' 
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(admin_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Password validation
    if (admin_password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', admin_email)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        error: 'An account with this email already exists' 
      }, { status: 409 });
    }

    // Create registration request
    const { data: registration, error: regError } = await supabase
      .from('tenant_registrations')
      .insert({
        organization_name,
        admin_email,
        admin_name,
        industry,
        company_size,
        requested_plan,
        metadata: {
          registration_ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      })
      .select()
      .single();

    if (regError) {
      return NextResponse.json({ error: regError.message }, { status: 400 });
    }

    // Auto-approve for now (in production, this might require manual approval)
    const autoApprove = true;

    if (autoApprove) {
      // Create the tenant immediately
      const { data: orgData, error: orgError } = await supabase
        .rpc('create_tenant', {
          org_name: organization_name,
          admin_email,
          admin_name,
          plan_name: requested_plan
        });

      if (orgError) {
        return NextResponse.json({ error: orgError.message }, { status: 500 });
      }

      // Create auth user using admin client
      const supabaseClient = createClient();
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: admin_email,
        password: admin_password,
        options: {
          data: {
            full_name: admin_name,
            organization_id: orgData
          }
        }
      });

      if (authError) {
        console.error('Auth error during registration:', authError);
        return NextResponse.json({ 
          error: 'Failed to create user account: ' + authError.message 
        }, { status: 500 });
      }

      // Update registration as approved
      await supabase
        .from('tenant_registrations')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', registration.id);

      return NextResponse.json({ 
        message: 'Organization registered successfully. Please check your email to verify your account.',
        registration_id: registration.id,
        organization_id: orgData,
        requires_email_verification: !authData.user?.email_confirmed_at
      }, { status: 201 });
    } else {
      // Manual approval required
      return NextResponse.json({ 
        message: 'Registration submitted successfully. You will be notified when your organization is approved.',
        registration_id: registration.id,
        status: 'pending_approval'
      }, { status: 202 });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/tenant/register - Check registration status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registration_id');
    const email = searchParams.get('email');

    if (!registrationId && !email) {
      return NextResponse.json({ 
        error: 'Either registration_id or email parameter is required' 
      }, { status: 400 });
    }

    const supabase = await createServerClient();
    
    let query = supabase.from('tenant_registrations').select('*');
    
    if (registrationId) {
      query = query.eq('id', registrationId);
    } else {
      query = query.eq('admin_email', email);
    }

    const { data: registration, error } = await query.single();

    if (error || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Don't expose sensitive metadata
    const { metadata, ...safeRegistration } = registration;

    return NextResponse.json({ registration: safeRegistration });
  } catch (error) {
    console.error('Check registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}