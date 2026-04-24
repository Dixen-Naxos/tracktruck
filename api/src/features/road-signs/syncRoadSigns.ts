import { ObjectId } from "mongodb";
import { roadSigns } from "../../db/RoadSign.js";
import { fetchRoadSignsFromOverpass } from "../../services/overpass.js";

export type SyncBbox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type SyncResult = {
  fetched: number;
  upserted: number;
};

/**
 * Fetches truck-restricting road signs from Overpass for the given bbox
 * and upserts them into MongoDB.
 */
export async function syncRoadSigns(bbox: SyncBbox): Promise<SyncResult> {
  const signs = await fetchRoadSignsFromOverpass(bbox);

  if (signs.length === 0) return { fetched: 0, upserted: 0 };

  const ops = signs.map((sign) => ({
    updateOne: {
      filter: { osmId: sign.osmId, osmType: sign.osmType },
      update: {
        $set: {
          ...sign,
          fetchedAt: new Date(),
        },
        $setOnInsert: { _id: new ObjectId() },
      },
      upsert: true,
    },
  }));

  const result = await roadSigns.bulkWrite(ops, { ordered: false });

  return {
    fetched: signs.length,
    upserted: result.upsertedCount + result.modifiedCount,
  };
}
