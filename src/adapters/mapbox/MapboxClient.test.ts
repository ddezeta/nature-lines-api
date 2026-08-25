import { isMapboxApiError, MapboxClient } from "./MapboxClient";

describe("MapboxClient", () => {
  const baseUrl = "https://api.mapbox.com";
  const accessToken = "test-token";

  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it("should make request with URL and access token", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const client = new MapboxClient(baseUrl, accessToken);
    await client.get("/some/path", { foo: "bar" });

    const requestedUrl = fetchMock.mock.calls[0][0];
    expect(requestedUrl.toString()).toBe(
      "https://api.mapbox.com/some/path?foo=bar&access_token=test-token",
    );
  });

  it("should succeed HTTP call JSON body response on success", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ hello: "world" }), { status: 200 }));

    const client = new MapboxClient(baseUrl, accessToken);
    const result = await client.get<{ hello: string }>("/some/path");

    expect(result).toEqual({ hello: "world" });
  });

  it("should throw MapboxApiError with the status and path when the response is not ok", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 503 }));

    const client = new MapboxClient(baseUrl, accessToken);

    let caught: unknown;
    try {
      await client.get("/failing/path");
    } catch (error) {
      caught = error;
    }

    expect(isMapboxApiError(caught)).toBe(true);
    expect((caught as { status: number }).status).toBe(503);
    expect((caught as { path: string }).path).toBe("/failing/path");
  });
});

describe("isMapboxApiError", () => {
  it("should return false for a regular Error", () => {
    expect(isMapboxApiError(new Error("plain"))).toBe(false);
  });

  it("should return false for non-Error values", () => {
    expect(isMapboxApiError({ name: "MapboxApiError" })).toBe(false);
  });
});