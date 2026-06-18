import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const handleAlchemyWebhook = httpAction(async (ctx, request) => {
  const body = await request.json();

  const activities = body?.event?.activity || [];
  for (const activity of activities) {
    const txHash = activity.hash;
    if (!txHash) continue;

    try {
      await ctx.runMutation(api.transactions.confirmTransaction, {
        sourceTxHash: txHash,
      });
    } catch (e) {
      console.log(`Ignoring tx ${txHash}: not found in DB`);
    }
  }

  return new Response("OK", { status: 200 });
});

const handleHeliusWebhook = httpAction(async (ctx, request) => {
  const body = await request.json();

  const transactions = Array.isArray(body) ? body : [body];
  for (const tx of transactions) {
    const signature = tx.signature || tx.transaction?.signatures?.[0];
    if (!signature) continue;

    try {
      await ctx.runMutation(api.transactions.confirmTransaction, {
        sourceTxHash: signature,
      });
    } catch (e) {
      console.log(`Ignoring sig ${signature}: not found in DB`);
    }
  }

  return new Response("OK", { status: 200 });
});

http.route({
  path: "/webhooks/alchemy",
  method: "POST",
  handler: handleAlchemyWebhook,
});

http.route({
  path: "/webhooks/helius",
  method: "POST",
  handler: handleHeliusWebhook,
});

export default http;
