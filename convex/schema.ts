import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  paymentLinks: defineTable({
    // Lookup key (used as URL slug: justpay.wtf/abc1234)
    shortCode: v.string(),

    // Receiver identity — the only required field
    receiverAddress: v.string(),
    receiverEmail: v.optional(v.string()),

    // Payment preferences — all optional.
    // If not set, sender chooses freely in the widget.
    destinationChain: v.optional(v.string()),
    destinationTokenAddress: v.optional(v.string()),
    destinationTokenSymbol: v.optional(v.string()),
    amount: v.optional(v.string()), // human-readable (e.g. "10.5")

    // Optional description shown on the checkout page
    note: v.optional(v.string()),

    // Lifecycle
    status: v.union(
      v.literal("active"),
      v.literal("completed"), // single-use fixed-amount links after payment
      v.literal("cancelled"),  // receiver manually deactivated
    ),
    expiresAt: v.optional(v.number()), // ms epoch. undefined = never expires.
  })
    .index("by_shortCode", ["shortCode"])
    .index("by_receiver", ["receiverAddress"]),

  transactions: defineTable({
    linkId: v.id("paymentLinks"),
    payerAddress: v.string(),
    sourceChain: v.string(),
    sourceToken: v.optional(v.string()),
    sourceTxHash: v.string(),
    sourceAmount: v.string(),
    destinationTxHash: v.optional(v.string()),
    destinationAmount: v.optional(v.string()),
    lifiRouteId: v.optional(v.string()),
    bridgeUsed: v.optional(v.string()),
    protocolFee: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("bridging"),
      v.literal("confirmed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_link", ["linkId"])
    .index("by_sourceTxHash", ["sourceTxHash"]),
});
