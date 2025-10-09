import Hls from "hls.js";

export function useHlsSupported() {
    return Hls.isSupported();
}