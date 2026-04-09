// export const dynamic = "force-dynamic";

import { findSaleByIdAction, SalePrintDocument } from "@features/sales";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const sale = await findSaleByIdAction(id);

	if (sale?.items?.length === 0) {
		return new Response("Not found", { status: 404 });
	}

	const url = new URL(request.url);
	const isInvoice = url.searchParams.get("type") === "invoice";

	const buffer = await renderToBuffer(<SalePrintDocument sale={sale} isInvoice={isInvoice} />);

	return new NextResponse(new Uint8Array(buffer), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `inline; filename="${isInvoice ? "Facture" : "Devis"}-${sale.clientName.replace(/\s+/g, "_")}.pdf"`,
		},
	});
}
