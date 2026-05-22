import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Method guard — POST only
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    // 1. Verify JWT and extract userId
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // User client — verify JWT and derive userId
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const userId = user.id;

    // Admin client — privileged operations (service_role, server-only)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 2. Storage cleanup — best-effort, logged but non-blocking
    try {
      const { data: avatarFiles } = await adminClient.storage
        .from('avatars')
        .list(userId);
      if (avatarFiles && avatarFiles.length > 0) {
        const filePaths = avatarFiles.map((f) => `${userId}/${f.name}`);
        const { error: storageError } = await adminClient.storage
          .from('avatars')
          .remove(filePaths);
        if (storageError) {
          console.error(
            `[delete-account] Storage cleanup failed for ${userId}:`,
            storageError.message,
          );
        }
      }
    } catch (storageErr) {
      console.error(
        `[delete-account] Storage cleanup error for ${userId}:`,
        storageErr,
      );
      // Continue — storage cleanup is best-effort
    }

    // 3. Delete tasks — cascades to checklist_items + task_activity_events
    const { error: tasksError } = await adminClient
      .from('tasks')
      .delete()
      .eq('user_id', userId);
    if (tasksError) {
      console.error(
        `[delete-account] Tasks deletion failed for ${userId}:`,
        tasksError.message,
      );
      return jsonResponse(
        { error: 'Account deletion failed. Please try again.' },
        500,
      );
    }

    // 4. Delete auth user — cascades to profiles, recurrence_templates, inbox_items
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error(
        `[delete-account] Auth deletion failed for ${userId}:`,
        deleteError.message,
      );
      return jsonResponse(
        { error: 'Account deletion failed. Please try again.' },
        500,
      );
    }

    return jsonResponse({ success: true }, 200);
  } catch (err) {
    console.error('[delete-account] Unexpected error:', err);
    return jsonResponse(
      { error: 'An unexpected error occurred. Please try again.' },
      500,
    );
  }
});
