import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  paymentLinks: defineTable({
    shortCode: v.string(),
    linkType: v.union(v.literal("invoice"), v.literal("tip_jar"), v.literal("recurring")),
    merchantAddress: v.string(),
    destinationChain: v.string(),
    destinationTokenAddress: v.optional(v.string()),
    destinationTokenSymbol: v.string(),
    amount: v.optional(v.string()),
    label: v.optional(v.string()),
    memo: v.optional(v.string()),
    merchantEmail: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("expired"), v.literal("cancelled")),
    expiresAt: v.optional(v.number()),
    linkIdHash: v.string(),
  })
    .index("by_shortCode", ["shortCode"])
    .index("by_merchant", ["merchantAddress"])
    .index("by_status", ["status"]),

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
    status: v.union(v.literal("pending"), v.literal("bridging"), v.literal("confirmed"), v.literal("failed"), v.literal("refunded")),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_link", ["linkId"])
    .index("by_sourceTxHash", ["sourceTxHash"]),
});
