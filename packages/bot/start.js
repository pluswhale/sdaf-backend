import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Register ts-node/esm
register("ts-node/esm", pathToFileURL("./server.ts"));