import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyLifiTransaction } from '../shared/lifi-verifier.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload = await req.json()
    const { linkId, txHash } = payload

    if (!linkId || !txHash) {
      return new Response(JSON.stringify({ error: 'Missing required params' }), { status: 400, headers: corsHeaders })
    }

    // 1. Fetch transaction record
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*, payment_links(*)')
      .eq('source_tx_hash', txHash)
      .eq('link_id', linkId)
      .single()

    if (txError || !txData) {
      return new Response(JSON.stringify({ error: 'Transaction not found in our records' }), { status: 404, headers: corsHeaders })
    }

    const result = await verifyLifiTransaction(supabase, resendApiKey, txData)

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
