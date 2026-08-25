import { env } from "../config/env";
import { MapboxClient } from "../adapters/mapbox/MapboxClient";
import { MapboxGeocodingAdapter } from "../adapters/mapbox/MapboxGeocodingAdapter";
import { MapboxDirectionsAdapter } from "../adapters/mapbox/MapboxDirectionsAdapter";
import { TrailService } from "../domain/TrailService";
import { TRAILS } from "../data/trails";

const mapboxClient = new MapboxClient("https://api.mapbox.com", env.mapboxAccessToken);
const geocodingAdapter = new MapboxGeocodingAdapter(mapboxClient);
const directionsAdapter = new MapboxDirectionsAdapter(mapboxClient);

export const trailService = new TrailService(geocodingAdapter, directionsAdapter, TRAILS);
