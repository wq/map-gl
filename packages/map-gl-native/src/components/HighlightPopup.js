import { ModalPopup } from "@wq/map";

export default function HighlightPopup({ inMap, data, onClose }) {
    if (inMap) {
        return null;
    } else {
        return <ModalPopup data={data} onClose={onClose} />;
    }
}

export function InMapPopup() {
    // FIXME: Leverage Callout from @maplibre/maplibre-react-native
    return null;
}
