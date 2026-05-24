import { z } from "zod";

export const getCoordinatesSchema = z.object({
	imei: z.string().length(15, "IMEI deve ter 15 dígitos"),
});

