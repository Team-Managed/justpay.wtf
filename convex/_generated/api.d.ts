/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules } from "convex/server";
import type * as links from "../links.js";
import type * as transactions from "../transactions.js";
import type * as webhooks from "../webhooks.js";
import type * as crons from "../crons.js";

/**
 * A utility for referencing Convex functions in your app's API.
 */
declare const fullApi: ApiFromModules<{
  links: typeof links;
  transactions: typeof transactions;
  webhooks: typeof webhooks;
  crons: typeof crons;
}>;

export declare const api: typeof fullApi;
export declare const internal: typeof fullApi;
