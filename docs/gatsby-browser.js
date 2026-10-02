import { setWorkerUrl } from "maplibre-gl";

export const onClientEntry = () => {
    setWorkerUrl(
        new URL(
            "/js/maplibre-gl-worker.mjs",
            window.location.origin,
        ).toString(),
    );
};
