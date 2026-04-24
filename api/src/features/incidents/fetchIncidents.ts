import { ObjectId } from "mongodb";
import { incidents, type Incident } from "../../db/Incident.js";
import { set } from "zod";
import proj4 from "proj4";

// Define Lambert II étendu (EPSG:27572) projection
proj4.defs(
  "EPSG:27572",
  "+proj=lcc +lat_1=46.8 +lat_2=45.89999999999999 +lat_0=45.89999999999999 +lon_0=2.33722917 +k_0=0.99987742 +x_0=600000 +y_0=2100000 +ellps=clrk80 +towgs84=-168,-60,320,0,0,0,0 +units=m +no_defs",
);

type SytadinIncident = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    info: string;
  };
};

type SytadinResponse = {
  features: SytadinIncident[];
};

function convertLambertToGPS(x: number, y: number): [number, number] {
  const [lng, lat] = proj4("EPSG:27572", "EPSG:4326", [x, y]);
  return [lng, lat];
}

export async function fetchIncidentsAroundParis() {
  const firstResponse = await fetch(
    "https://www1.sytadin.fr/carto/dynamique/cartoTempsReel.json",
  );

  if (!firstResponse.ok) {
    throw new Error(
      `Failed to fetch time parameter from Sytadin: ${firstResponse.status} ${firstResponse.statusText}`,
    );
  }
  const firstData = await firstResponse.json();
  const timeFormatted = firstData.dossier;

  console.log(
    `Fetching incidents from Sytadin with time parameter: ${timeFormatted}`,
  );
  const response = await fetch(
    `https://www1.sytadin.fr/carto/dynamique/${timeFormatted}/evenements/troncon.json`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch incidents: ${response.status} ${response.statusText}`,
    );
  }

  const data: SytadinResponse = await response.json();

  const fetchedIncidents: Incident[] = data.features.map((feature) => {
    const [lng, lat] = convertLambertToGPS(
      feature.geometry.coordinates[0],
      feature.geometry.coordinates[1],
    );
    return {
      _id: new ObjectId(),
      type: "external",
      position: {
        lat,
        lng,
      },
      timestamp: new Date(),
      comment: feature.properties.info,
    };
  });

  await incidents.deleteMany({ type: "external" });
  await incidents.insertMany(fetchedIncidents);
}

export async function startSytadinPolling() {
  while (true) {
    await fetchIncidentsAroundParis().catch((error) => {
      console.error("Error fetching incidents from Sytadin:", error);
    });

    await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
  }
}
