import { describe, expect, it } from "vitest";
import { VEHICLE_FIELDS, assessVehicleExtraction, vehicleExtractionSchema } from "./vehicle-ai";

function extraction() {
  return vehicleExtractionSchema.parse({
    fields: Object.fromEntries(VEHICLE_FIELDS.map((field) => [field, null])),
    reifen_liste: [],
    confidence: 0.92,
    criticalConfidence: { document: 0.95, vin: 0.98, firstRegistration: 0.95, color: 0.9 },
    reviewReasons: [],
    sourceNotes: [],
  });
}

describe("vehicle AI validation", () => {
  it("accepts a matching VIN and flags only truly missing authority fields", () => {
    const value = extraction();
    value.fields.vin = "WVWZZZ1JZXW000001";
    value.fields.ez = "02.03.2020";
    value.fields.marke = "VOLKSWAGEN";
    value.fields.K = "e1*2007/46*0001*01";
    expect(assessVehicleExtraction(value, { vin: "WVWZZZ1JZXW000001", firstRegistration: "2020-03-02" })).toEqual([]);
  });

  it("never hides a VIN contradiction", () => {
    const value = extraction();
    value.fields.vin = "WVWZZZ1JZXW000002";
    value.fields.marke = "VOLKSWAGEN";
    value.fields.K = "e1*2007/46*0001*01";
    const reasons = assessVehicleExtraction(value, { vin: "WVWZZZ1JZXW000001", firstRegistration: "2020-03-02" });
    expect(reasons.some((reason) => reason.includes("FIN") && reason.includes("nicht"))).toBe(true);
  });
});
