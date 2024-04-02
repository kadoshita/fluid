import { pgTable, text, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const records = pgTable(
  'records',
  {
    id: uuid('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    url: text('url').notNull().unique(),
    domain: text('domain').notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    image: text('image'),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    accountId: uuid('account_id').notNull(),
  },
  (table) => {
    return {
      titleIdx: index('records_title_idx').on(table.title),
      urlIdx: index('records_url_idx').on(table.url),
      domainIdx: index('records_domain_idx').on(table.domain),
      accountIdIdx: index('records_account_id_idx').on(table.accountId),
    };
  },
);

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull().unique(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    enabled: boolean('enabled').default(false).notNull(),
    accountId: uuid('account_id').notNull(),
  },
  (table) => {
    return {
      nameIdx: index('categories_name_idx').on(table.name),
      accountIdIdx: index('categories_account_id_idx').on(table.accountId),
    };
  },
);

export const recordsRelations = relations(records, ({ one }) => ({
  category: one(categories, {
    fields: [records.categoryId],
    references: [categories.id],
  }),
}));
