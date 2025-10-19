import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting to delete all vehicle images...');

    // List all files in vehicle-images bucket
    const { data: files, error: listError } = await supabase.storage
      .from('vehicle-images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      console.error('Error listing files:', listError);
      throw listError;
    }

    console.log(`Found ${files?.length || 0} files to delete`);

    if (files && files.length > 0) {
      // Delete all files
      const filePaths = files.map(file => file.name);
      
      const { error: deleteError } = await supabase.storage
        .from('vehicle-images')
        .remove(filePaths);

      if (deleteError) {
        console.error('Error deleting files:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully deleted ${filePaths.length} files`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Deleted ${files?.length || 0} files from vehicle-images bucket`,
        filesDeleted: files?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-all-vehicle-images:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});