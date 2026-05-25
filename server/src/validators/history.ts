import { z } from "zod";

export const historyParamsSchema = z.object({
	imei: z.string().length(15, "IMEI deve ter 15 dígitos"),
});

export const historyQuerySchema = z.object({
	startDate: z.string().datetime({ message: "startDate deve ser ISO datetime" }),
	endDate: z.string().datetime({ message: "endDate deve ser ISO datetime" }),
});
