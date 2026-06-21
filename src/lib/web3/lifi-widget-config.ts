import type { WidgetConfig } from "@lifi/widget";
import {
  parseChainIdForWidget,
  getNativeTokenAddress,
} from "@/lib/config/network";

export interface CheckoutWidgetOptions {
  /** Required — where the funds go */
  receiverAddress: string;
  /** Optional — if set, locks the destination chain in the widget */
  destinationChain?: string | null;
  /** Optional — if set, locks the destination token in the widget */
  destinationTokenSymbol?: string | null;
  destinationTokenAddress?: string | null;
  /** Optional — if set, pre-fills and locks the amount */
  amount?: string | null;
}

/**
 * Builds the LI.FI WidgetConfig for a payment checkout.
 *
 * If the receiver specified preferences, those fields are locked.
 * If not, the widget runs in open mode — sender picks source AND destination freely.
 */
export function buildCheckoutWidgetConfig(
  opts: CheckoutWidgetOptions,
): WidgetConfig {
  const hasChainPreference = !!opts.destinationChain;
  const hasTokenPreference = !!(
    opts.destinationTokenSymbol || opts.destinationTokenAddress
  );

  const toChainId = hasChainPreference
    ? parseChainIdForWidget(opts.destinationChain!)
    : undefined;
  const toTokenAddr = hasTokenPreference
    ? (opts.destinationTokenAddress ??
      getNativeTokenAddress(opts.destinationChain ?? ""))
    : undefined;

  const config: WidgetConfig = {
    toAddress: {
      address: opts.receiverAddress,
    },

    // Only set toChain/toToken if the receiver specified them
    ...(toChainId !== undefined ? { toChain: toChainId as any } : {}),
    ...(toTokenAddr !== undefined ? { toToken: toTokenAddr } : {}),

    // Pre-fill amount for fixed links; leave undefined for open links
    ...(opts.amount && Number(opts.amount) > 0
      ? { toAmount: opts.amount }
      : {}),

    // Lock destination UI — receiver's preferences are not editable
    disabledUI: {
      ...(hasTokenPreference ? { toToken: true } : {}),
    },

    // Hide exchange-specific elements for a clean payment flow
    hiddenUI: {
      toAddress: true, // Already shown in PaymentCard above
      reverseTokensButton: true, // Not relevant for payments
      poweredBy: true,
    },

    // Restrict destination chain if receiver specified one (EVM numeric chains only)
    ...(hasChainPreference && typeof toChainId === "number"
      ? { chains: { to: { allow: [toChainId] } } }
      : {}),

    // Override "Exchange" header to "Payment"
    languageResources: {
      en: {
        header: {
          exchange: "Payment",
          from: "Pay from",
          to: "Receive on",
        },
        button: {
          exchange: "Pay Now",
        },
      },
    },

    // UI presentation — brutalist light theme to match the app
    variant: "compact",
    appearance: "light",
    theme: {
      colorSchemes: {
        light: {
          palette: {
            primary: { main: "#000000" },
            secondary: { main: "#3a3a3a" },
            background: { default: "#ffffff", paper: "#f5f0e6" },
            text: { primary: "#000000", secondary: "#3a3a3a" },
          },
        },
      },
      shape: { borderRadius: 0 } as any,
      typography: { fontFamily: '"Darker Grotesque", sans-serif' },
      container: {
        border: "3px solid #000000",
        borderRadius: "0px",
        background: "#ffffff",
      },
    },

    integrator: "justpay",

    // SDK config — provide CORS-friendly RPC URLs for major chains.
    // LiFi's default RPCs (arc-rpc.transferto.xyz, etc.) reject localhost CORS.
    sdkConfig: {
      rpcUrls: {
        1: ["https://eth.llamarpc.com"],         // Ethereum
        56: ["https://bsc-dataseed1.defibit.io", "https://bsc-rpc.publicnode.com"], // BSC
        137: ["https://polygon-rpc.com"],        // Polygon
        42161: ["https://arb1.arbitrum.io/rpc"], // Arbitrum
        10: ["https://mainnet.optimism.io"],     // Optimism
        8453: ["https://mainnet.base.org"],      // Base
        43114: ["https://api.avax.network/ext/bc/C/rpc"], // Avalanche
        250: ["https://rpc.ftm.tools"],          // Fantom
        100: ["https://rpc.gnosischain.com"],    // Gnosis
      },
    },

    feeConfig: {
      fee: 0,
    },
  };

  return config;
}
