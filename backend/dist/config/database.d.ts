import * as schema from '../db/schema';
declare const client: import("@libsql/client").Client;
export declare const db: import("drizzle-orm/libsql").LibSQLDatabase<typeof schema>;
export { client };
export type Database = typeof db;
//# sourceMappingURL=database.d.ts.map