/* eslint-disable */
import type { DataModelFromSchemaDefinition, GenericId } from "convex/server";
import type schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type Id<T extends string> = GenericId<T>;
