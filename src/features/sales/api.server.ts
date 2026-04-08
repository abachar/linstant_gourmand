import { db, saleItems, sales } from "@common/db";
import { endOfDay, startOfDay } from "date-fns";
import { asc, between, desc, eq } from "drizzle-orm";

export async function getDistinctClients() {
	return await db
		.selectDistinctOn([sales.clientName, sales.deliveryAddress], {
			clientName: sales.clientName,
			deliveryAddress: sales.deliveryAddress,
		})
		.from(sales)
		.orderBy(asc(sales.clientName), asc(sales.deliveryAddress));
}

export async function findSalesByRange(from: Date, end: Date) {
	return await db
		.select()
		.from(sales)
		.where(between(sales.deliveryDatetime, startOfDay(from), endOfDay(end)))
		.orderBy(desc(sales.deliveryDatetime));
}

export async function findSaleById(id: string) {
	const [sale] = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
	if (!sale) return sale;
	const items = await db.select().from(saleItems).where(eq(saleItems.saleId, id)).orderBy(asc(saleItems.sortOrder));
	return { ...sale, items };
}

type SaleItemData = {
	description: string;
	unitPrice: string;
	quantity: number;
};

type SaleData = {
	clientName: string;
	deliveryDatetime: string;
	deliveryAddress?: string;
	description?: string;
	amount: string;
	deposit: string;
	depositPaymentMethod: string;
	remaining: string;
	remainingPaymentMethod: string;
	items?: SaleItemData[];
};

export async function createSale(data: SaleData) {
	return await db.transaction(async (tx) => {
		const [result] = await tx
			.insert(sales)
			.values({
				clientName: data.clientName,
				deliveryDatetime: new Date(data.deliveryDatetime),
				deliveryAddress: data.deliveryAddress ?? null,
				description: data.description ?? null,
				amount: data.amount,
				deposit: data.deposit,
				depositPaymentMethod: data.depositPaymentMethod,
				remaining: data.remaining,
				remainingPaymentMethod: data.remainingPaymentMethod,
			})
			.returning({ id: sales.id });

		if (data.items?.length) {
			await tx.insert(saleItems).values(
				data.items.map((item, i) => ({
					saleId: result.id,
					description: item.description,
					unitPrice: item.unitPrice,
					quantity: item.quantity,
					sortOrder: i,
				})),
			);
		}

		return { id: result.id };
	});
}

export async function deleteSaleById(id: string) {
	// saleItems has onDelete: cascade, so items are auto-deleted
	await db.delete(sales).where(eq(sales.id, id));
}

export async function updateSale(data: SaleData & { id: string }) {
	await db.transaction(async (tx) => {
		await tx
			.update(sales)
			.set({
				clientName: data.clientName,
				deliveryDatetime: new Date(data.deliveryDatetime),
				deliveryAddress: data.deliveryAddress ?? null,
				description: data.description ?? null,
				amount: data.amount,
				deposit: data.deposit,
				depositPaymentMethod: data.depositPaymentMethod,
				remaining: data.remaining,
				remainingPaymentMethod: data.remainingPaymentMethod,
			})
			.where(eq(sales.id, data.id));

		// Replace all items
		await tx.delete(saleItems).where(eq(saleItems.saleId, data.id));
		if (data.items?.length) {
			await tx.insert(saleItems).values(
				data.items.map((item, i) => ({
					saleId: data.id,
					description: item.description,
					unitPrice: item.unitPrice,
					quantity: item.quantity,
					sortOrder: i,
				})),
			);
		}
	});
}
