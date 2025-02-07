/**
 * @jest-environment jsdom
 */
import { MapProvider } from "../index.js";

test("it loads", () => {
    expect(MapProvider.displayName).toBe("MapProvider:wq");
});
