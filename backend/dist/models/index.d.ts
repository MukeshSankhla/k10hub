import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '../db/schema';
export type Author = InferSelectModel<typeof schema.authors>;
export type NewAuthor = InferInsertModel<typeof schema.authors>;
export type Category = InferSelectModel<typeof schema.categories>;
export type NewCategory = InferInsertModel<typeof schema.categories>;
export type Project = InferSelectModel<typeof schema.projects>;
export type NewProject = InferInsertModel<typeof schema.projects>;
export type Tag = InferSelectModel<typeof schema.tags>;
export type NewTag = InferInsertModel<typeof schema.tags>;
export type Tutorial = InferSelectModel<typeof schema.tutorials>;
export type NewTutorial = InferInsertModel<typeof schema.tutorials>;
export type FirmwareVersion = InferSelectModel<typeof schema.firmwareVersions>;
export type NewFirmwareVersion = InferInsertModel<typeof schema.firmwareVersions>;
//# sourceMappingURL=index.d.ts.map