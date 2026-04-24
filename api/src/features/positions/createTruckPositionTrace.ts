import { ObjectId } from "mongodb";
import {
  truckPositionTraces,
  type TruckPositionTrace,
} from "../../db/TruckPositionTrace.js";
import type { GpsPosition } from "../../db/GpsPosition.js";

export type CreateTruckPositionTraceInput = {
  position: GpsPosition;
  timestamp?: Date;
};

export async function createTruckPositionTrace(
  driverId: ObjectId,
  input: CreateTruckPositionTraceInput,
): Promise<TruckPositionTrace> {
  const trace: TruckPositionTrace = {
    _id: new ObjectId(),
    driverId,
    position: input.position,
    timestamp: input.timestamp ?? new Date(),
  };

  await truckPositionTraces.insertOne(trace);

  return trace;
}