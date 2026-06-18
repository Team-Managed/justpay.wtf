import { httpRouter } from "convex/server";
import { handleAlchemyWebhook, handleHeliusWebhook } from "./webhooks";

const http = httpRouter();

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
