'use client'

import { useState, useEffect } from 'react'

export type PaymentStatus = 'active' | 'pending' | 'completed' | 'expired' | 'swap_in_progress'

interface PaymentState {
  status: PaymentStatus
  txHash?: string
  bridgeTxHash?: string
  error?: string
}

export function usePaymentState(shortCode: string, payerAddress?: string) {
  const [state, setState] = useState<PaymentState>({ status: 'active' })

  useEffect(() => {
    // 1. Fetch current status from Supabase
    const fetchStatus = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://demo.supabase.co'
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'demo'
        
        const res = await fetch(`${supabaseUrl}/rest/v1/payment_links?short_code=eq.${shortCode}&select=status`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        })
        const data = await res.json()
        if (data && data.length > 0) {
          const dbStatus = data[0].status
          if (dbStatus === 'completed' || dbStatus === 'expired') {
            setState(s => ({ ...s, status: dbStatus }))
            return
          }
        }
        
        // 2. Check local sessionStorage for in-progress swap
        if (payerAddress) {
          const sessionKey = `envoy_swap:${shortCode}:${payerAddress}`
          const swapState = sessionStorage.getItem(sessionKey)
          if (swapState === 'SWAP_COMPLETE') {
            setState(s => ({ ...s, status: 'swap_in_progress' }))
          }
        }
      } catch (e) {
        console.error('Failed to fetch payment status', e)
      }
    }

    fetchStatus()
    
    // Poll every 5s if active or pending (Webhooks handle backend status, this just updates UI)
    const interval = setInterval(() => {
      if (state.status === 'active' || state.status === 'pending') {
        fetchStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [shortCode, payerAddress, state.status])

  return {
    state,
    setPending: (txHash: string, bridgeTxHash?: string) => setState({ status: 'pending', txHash, bridgeTxHash }),
    setSwapComplete: () => {
      if (payerAddress) {
        sessionStorage.setItem(`envoy_swap:${shortCode}:${payerAddress}`, 'SWAP_COMPLETE')
        setState({ status: 'swap_in_progress' })
      }
    },
    clearSwapState: () => {
      if (payerAddress) {
        sessionStorage.removeItem(`envoy_swap:${shortCode}:${payerAddress}`)
      }
    }
  }
}
