import { index, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const sales = pgTable(
	"sales",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		clientName: text("client_name").notNull(),
		deliveryDatetime: timestamp("delivery_datetime", {
			withTimezone: true,
		}).notNull(),
		deliveryAddress: text("delivery_address"),
		description: text("description"),
		amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
		deposit: numeric("deposit", { precision: 10, scale: 2 }).notNull(),
		depositPaymentMethod: text("deposit_payment_method").notNull(),
		remaining: numeric("remaining", { precision: 10, scale: 2 }).notNull(),
		remainingPaymentMethod: text("remaining_payment_method").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("idx_sales_delivery_datetime").on(t.deliveryDatetime)],
);

export const saleItems = pgTable(
	"sale_items",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		saleId: uuid("sale_id")
			.notNull()
			.references(() => sales.id, { onDelete: "cascade" }),
		description: text("description").notNull(),
		unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
		quantity: integer("quantity").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(t) => [index("idx_sale_items_sale_id").on(t.saleId)],
);

export const purchases = pgTable(
	"purchases",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		date: timestamp("date", { withTimezone: true }).notNull(),
		amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
		description: text("description"),
		importRef: text("import_ref").unique(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("idx_purchases_date").on(t.date)],
);

export const products = pgTable(
	"products",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		productName: text("product_name").notNull(),
		quantity: integer("quantity").notNull().default(0),
		expirationDate: timestamp("expiration_date", { withTimezone: true }),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("idx_products_product_name").on(t.productName)],
);
