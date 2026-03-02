import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const addSchema = z.object({
  label: z.string().trim().max(60).default(''),
  phoneNumber: z.string().trim().min(1).max(30),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  // Optional: fetch another user's phone numbers. RLS still applies.
  const userId = request.nextUrl.searchParams.get('userId') || session.userId;

  const { data, error } = await supabase
    .from('phone_numbers')
    .select('id,user_id,label,phone_number,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  return mergeCookies(supabaseResponse, NextResponse.json({ phoneNumbers: data ?? [] }));
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const body = await request.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return mergeCookies(supabaseResponse, jsonError('Invalid phone number.'));

  const { data, error } = await supabase
    .from('phone_numbers')
    .insert({
      user_id: session.userId,
      label: parsed.data.label,
      phone_number: parsed.data.phoneNumber,
    })
    .select('*')
    .single();

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  return mergeCookies(supabaseResponse, NextResponse.json({ phoneNumber: data }));
}

export async function DELETE(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return mergeCookies(supabaseResponse, jsonError('Invalid ID.'));

  const { error } = await supabase
    .from('phone_numbers')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', session.userId);

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  return mergeCookies(supabaseResponse, NextResponse.json({ deleted: true }));
}
