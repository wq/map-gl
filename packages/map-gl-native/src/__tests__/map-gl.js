import * as mapgl from "../../../map-gl/src/index.native.js";

test("it loads", () => {
    for (const key in mapgl) {
        expect(mapgl).toHaveProperty(key, expect.anything());
    }
});
