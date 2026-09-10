/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as analytics from "../analytics.js";
import type * as businesses from "../businesses.js";
import type * as clientNotifications from "../clientNotifications.js";
import type * as destinations from "../destinations.js";
import type * as emailSettings from "../emailSettings.js";
import type * as funnel from "../funnel.js";
import type * as helpers from "../helpers.js";
import type * as printCards from "../printCards.js";
import type * as reseller from "../reseller.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  analytics: typeof analytics;
  businesses: typeof businesses;
  clientNotifications: typeof clientNotifications;
  destinations: typeof destinations;
  emailSettings: typeof emailSettings;
  funnel: typeof funnel;
  helpers: typeof helpers;
  printCards: typeof printCards;
  reseller: typeof reseller;
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
