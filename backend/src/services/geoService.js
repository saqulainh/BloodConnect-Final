/**
 * Emergency Intelligence Map System (EIMS)
 * Geo Service
 */

/**
 * Fuzz coordinates to protect donor exact locations.
 * Specifically offsets latitude and longitude slightly (approx 100-200 meters).
 * @param {Array} coords - [longitude, latitude]
 * @returns {Array} - [fuzzed_longitude, fuzzed_latitude]
 */
export const fuzzLocation = (coords) => {
    if (!coords || coords.length !== 2) return coords;

    const [lng, lat] = coords;

    // ~1 degree lat = 111km
    // We want a fuzz of roughly +/- 0.001 to 0.002 degrees (approx 100-200 meters)
    const latOffset = (Math.random() - 0.5) * 0.004; // -0.002 to +0.002

    // longitude degrees shrink near the poles, but for general purposes, a small offset is fine
    const lngOffset = (Math.random() - 0.5) * 0.004;

    return [
        lng + lngOffset,
        lat + latOffset
    ];
};
