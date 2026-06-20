/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chatHistory from "../chatHistory.js";
import type * as clients from "../clients.js";
import type * as dev from "../dev.js";
import type * as myFunctions from "../myFunctions.js";
import type * as outreachBatches from "../outreachBatches.js";
import type * as projects from "../projects.js";
import type * as seed from "../seed.js";
import type * as signals from "../signals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  chatHistory: typeof chatHistory;
  clients: typeof clients;
  dev: typeof dev;
  myFunctions: typeof myFunctions;
  outreachBatches: typeof outreachBatches;
  projects: typeof projects;
  seed: typeof seed;
  signals: typeof signals;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
