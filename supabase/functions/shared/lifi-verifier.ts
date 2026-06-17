export async function verifyLifiTransaction(supabase: any, resendApiKey: string, txData: any) {
  const linkId = txData.link_id
  const txHash = txData.source_tx_hash
  const paymentLink = txData.payment_links
  
  if (paymentLink.status === 'completed' || paymentLink.status === 'partial') {
    return { success: true, message: 'Already verified', status: paymentLink.status }
  }

  // Chain IDs mappings for LI.FI API
  const getChainId = (chainName: string) => {
    switch (chainName) {
      case 'ethereum': return 1;
      case 'solana': return 1151111081099710;
      case 'sui': return 9270000000000000;
      // Add other chain mappings as needed
      case 'polygon': return 137;
      case 'arbitrum': return 42161;
      case 'optimism': return 10;
      case 'base': return 8453;
      case 'bsc': return 56;
      default: return null;
    }
  }

  const fromChain = getChainId(txData.source_chain)
  const toChain = getChainId(paymentLink.destination_chain)

  if (!fromChain || !toChain) {
    throw new Error(`Unsupported chain in DB: ${txData.source_chain} or ${paymentLink.destination_chain}`)
  }

  // Poll LI.FI Status API
  const lifiUrl = `https://li.quest/v1/status?txHash=${txHash}&fromChain=${fromChain}&toChain=${toChain}`
  const lifiRes = await fetch(lifiUrl)
  
  if (!lifiRes.ok) {
    if (lifiRes.status === 404) {
       return { status: 'pending', substatus: 'NOT_FOUND', message: 'Transaction not indexed yet. Retry later.' }
    }
    throw new Error(`LI.FI API returned ${lifiRes.status}`)
  }

  const lifiStatus = await lifiRes.json()

  // Evaluate Status
  if (lifiStatus.status === 'DONE') {
    const substatus = lifiStatus.substatus || 'COMPLETED'
    const rawAmountReceived = lifiStatus.receiving?.amount || '0'
    const isPartial = substatus === 'PARTIAL'

    // Update Transactions table
    await supabase
      .from('transactions')
      .update({
        status: 'confirmed',
        dest_tx_hash: lifiStatus.receiving?.txHash,
        substatus: substatus,
        substatus_message: lifiStatus.substatusMessage,
        amount_received: rawAmountReceived
      })
      .eq('source_tx_hash', txHash)

    // Update Payment Links table
    const finalLinkStatus = isPartial ? 'partial' : 'completed'
    await supabase
      .from('payment_links')
      .update({ status: finalLinkStatus })
      .eq('id', linkId)

    // Send Email
    const merchantEmail = paymentLink.email_alert
    if (merchantEmail && resendApiKey) {
      // Idempotency for email to prevent double-sends
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          link_id: linkId,
          sent_to: merchantEmail,
          event_type: isPartial ? 'payment_partial' : 'payment_received'
        })

      if (!logError) {
        const subject = isPartial ? 'Payment Received (Substitute Token)' : 'Payment Received!'
        const htmlMsg = isPartial 
          ? `<p>Your payment link received funds, but in a substitute token than originally quoted.</p><p>Substatus: ${lifiStatus.substatusMessage}</p><p>Please review your wallet.</p>`
          : `<p>Your payment link has been successfully fulfilled across the routing bridge.</p><p>Transaction: ${txHash}</p>`

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'justpay.wtf <notifications@justpay.wtf>',
            to: [merchantEmail],
            subject: subject,
            html: htmlMsg
          })
        })
      }
    }

    return { success: true, status: finalLinkStatus, substatus }
  }

  // Still pending/bridging
  // Update db status to bridging if not already
  if (txData.status !== 'bridging') {
    await supabase.from('transactions').update({ status: 'bridging' }).eq('source_tx_hash', txHash)
    await supabase.from('payment_links').update({ status: 'bridging' }).eq('id', linkId)
  }

  return { status: 'bridging', substatus: lifiStatus.substatus, message: lifiStatus.substatusMessage }
}
