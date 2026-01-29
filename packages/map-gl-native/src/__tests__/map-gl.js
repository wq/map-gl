import * as mapgl from "@wq/map-gl/src/index.native.js";

test("it loads", () => {
    for (const key in mapgl) {
        expect(mapgl).toHaveProperty(key, expect.anything());
    }
});
