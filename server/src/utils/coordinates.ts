export function convertCoordinates(
	dados: Array<{
		date: Date;
		latitudeDecimalDegrees: string;
		longitudeDecimalDegrees: string;
		latitudeHemisphere: string;
		longitudeHemisphere: string;
		speed: number;
	}>,
) {
	const dadosFinais: {
		coordinates: Array<{
			date: Date;
			latitudeDecimalDegrees: number;
			longitudeDecimalDegrees: number;
			speed: number;
		}>;
	} = { coordinates: [] };

	for (const data of dados) {
		let { date, latitudeDecimalDegrees: latDegStr, longitudeDecimalDegrees: lonDegStr, speed } = data;


		// latitude: always prepend "0"
		const latStr = `0${latDegStr}`;
		let g = parseFloat(latStr.substring(0, 3));
		let d = parseFloat(latStr.substring(3));
		let latitudeDecimalDegrees = g + d / 60;
		if (data.latitudeHemisphere === "S") {
			latitudeDecimalDegrees = latitudeDecimalDegrees * -1;
		}

		// longitude: prepend "0" only if length is 9
		let lonStr = lonDegStr;
		if (lonStr.length === 9) {
			lonStr = `0${lonStr}`;
		}
		g = parseFloat(lonStr.substring(0, 3));
		d = parseFloat(lonStr.substring(3));
		let longitudeDecimalDegrees = g + d / 60;
		if (data.latitudeHemisphere === "S") {
			longitudeDecimalDegrees = longitudeDecimalDegrees * -1;
		}

		speed = speed * 1.60934;

		dadosFinais.coordinates.push({
			date,
			latitudeDecimalDegrees,
			longitudeDecimalDegrees,
			speed,
		});
	}

	return dadosFinais;
}
