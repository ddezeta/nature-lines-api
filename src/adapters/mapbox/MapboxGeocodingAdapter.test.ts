import { MapboxGeocodingAdapter } from "./MapboxGeocodingAdapter";
import type { MapboxClient } from "./MapboxClient";

function makeClient(response: unknown) {
  return { get: jest.fn().mockResolvedValue(response) } as unknown as MapboxClient;
}

describe("MapboxGeocodingAdapter", () => {
  it("should request the forward geocode endpoint with the query and a limit of 1", async () => {
    const client = makeClient({
      features: [{ properties: { name: "Berthoud Pass", coordinates: { longitude: -105.7, latitude: 39.8 } } }],
    });
    const adapter = new MapboxGeocodingAdapter(client);

    await adapter.geocodePlace("Berthoud Pass, CO");

    expect(client.get).toHaveBeenCalledWith("/search/geocode/v6/forward", {
      q: "Berthoud Pass, CO",
      limit: "1",
    });
  });

  it("should map the first feature to a GeocodedPlace", async () => {
    const client = makeClient({
      features: [{ properties: { name: "Berthoud Pass", coordinates: { longitude: -105.7, latitude: 39.8 } } }],
    });
    const adapter = new MapboxGeocodingAdapter(client);

    const result = await adapter.geocodePlace("Berthoud Pass, CO");

    expect(result).toEqual({
      query: "Berthoud Pass, CO",
      name: "Berthoud Pass",
      longitude: -105.7,
      latitude: 39.8,
    });
  });

  it("should throw when no features are returned", async () => {
    const client = makeClient({ features: [] });
    const adapter = new MapboxGeocodingAdapter(client);

    await expect(adapter.geocodePlace("Nowhere")).rejects.toThrow(
      'No geocoding results found for query: "Nowhere"',
    );
  });
});
