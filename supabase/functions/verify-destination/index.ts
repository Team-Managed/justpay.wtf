import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { verifyMessage } from 'npm:ethers@6.10.0'
import nacl from 'npm:tweetnacl@1.0.3'
import bs58 from 'npm:bs58@5.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { signature, message, address, chainFamily } = await req.json()

    if (!signature || !message || !address || !chainFamily) {
      throw new Error('Missing required fields: signature, message, address, chainFamily')
    }

    // Verify signature based on chain
    let isValid = false;

    if (chainFamily === 'ethereum') {
      try {
        const recoveredAddress = verifyMessage(message, signature);
        isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      } catch (err) {
        console.error('EVM verification failed:', err);
      }
    } else if (chainFamily === 'solana') {
      try {
        const signatureUint8 = bs58.decode(signature);
        const messageUint8 = new TextEncoder().encode(message);
        const pubKeyUint8 = bs58.decode(address);
        
        isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);
      } catch (err) {
        console.error('Solana verification failed:', err);
      }
    } else {
      throw new Error(`Unsupported chain family: ${chainFamily}`);
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Connect to Supabase as Service Role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if destination already exists
    const { data: existing } = await supabase
      .from('payout_destinations')
      .select('id')
      .eq('address', address)
      .eq('chain_family', chainFamily)
      .maybeSingle();

    if (existing) {
      // Update verified_at
      const { error: updateError } = await supabase
        .from('payout_destinations')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (updateError) throw updateError;
      
      return new Response(
        JSON.stringify({ success: true, id: existing.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert new destination
    const { data, error } = await supabase
      .from('payout_destinations')
      .insert([{
        creator_address: address, // since they signed it, they are the creator
        chain_family: chainFamily,
        address: address,
        is_default: true,
        verified_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
