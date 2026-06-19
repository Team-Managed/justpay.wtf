import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function generateUniqueShortCode(ctx: any): Promise<string> {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = "";
    for (let i = 0; i < 7; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const existing = await ctx.db
      .query("paymentLinks")
      .withIndex("by_shortCode", (q: any) => q.eq("shortCode", code))
      .unique();
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique short code after 5 attempts");
}

export const createLink = mutation({
  args: {
    receiverAddress: v.string(),
    receiverEmail: v.optional(v.string()),
    destinationChain: v.optional(v.string()),
    destinationTokenSymbol: v.optional(v.string()),
    destinationTokenAddress: v.optional(v.string()),
    amount: v.optional(v.string()),
    note: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const shortCode = await generateUniqueShortCode(ctx);
    const id = await ctx.db.insert("paymentLinks", {
      shortCode,
      receiverAddress: args.receiverAddress,
      receiverEmail: args.receiverEmail,
      destinationChain: args.destinationChain,
      destinationTokenSymbol: args.destinationTokenSymbol,
      destinationTokenAddress: args.destinationTokenAddress,
      amount: args.amount,
      note: args.note,
      status: "active",
      expiresAt: args.expiresAt,
    });
    return { id, shortCode };
  },
});

export const getLinkByShortCode = query({
  args: { shortCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentLinks")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .unique();
  },
});

export const getLinksByReceiver = query({
  args: { receiverAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentLinks")
      .withIndex("by_receiver", (q) =>
        q.eq("receiverAddress", args.receiverAddress),
      )
      .collect();
  },
});
