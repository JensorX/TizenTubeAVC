import { configRead } from '../config.js';

/**
 * Advanced Codec Settings for TizenTube
 * 
 * This module intercepts browser media APIs to:
 * 1. Deactivate specific codecs (AV1, VP9, AVC, etc.) based on user selection.
 * 2. Limit frame rate (e.g., disable 60fps) to reduce CPU load.
 */

export function initAdvancedCodecs() {
    hookMediaSource();
}

function hookMediaSource() {
    if (typeof window.MediaSource === 'undefined') return;

    const originalIsTypeSupported = window.MediaSource.isTypeSupported;

    window.MediaSource.isTypeSupported = function (type) {
        const lowerType = type.toLowerCase();

        // Individual blocks
        const disableAV1 = configRead('disableAV1');
        const disableVP9 = configRead('disableVP9');
        const disableAVC = configRead('disableAVC');
        const disableVP8 = configRead('disableVP8');
        const disableHEVC = configRead('disableHEVC');
        const disable60fps = configRead('disable60fps');

        // Codec filtering
        if (disableAV1 && (lowerType.includes('av1') || lowerType.includes('av01'))) return false;
        if (disableVP9 && (lowerType.includes('vp9') || lowerType.includes('vp09'))) return false;
        if (disableAVC && (lowerType.includes('avc') || lowerType.includes('avc1'))) return false;
        if (disableVP8 && (lowerType.includes('vp8') || lowerType.includes('vp08'))) return false;
        if (disableHEVC && (lowerType.includes('hev') || lowerType.includes('hvc'))) return false;

        // Frame rate filtering
        const fpsMatch = /framerate=(\d+)/.exec(lowerType) || /fps=(\d+)/.exec(lowerType);
        if (disable60fps && fpsMatch && parseInt(fpsMatch[1]) > 30) {
            return false;
        }

        return originalIsTypeSupported.call(window.MediaSource, type);
    };

    // Also hook canPlayType on video prototype as a fallback
    const originalCanPlayType = HTMLMediaElement.prototype.canPlayType;
    HTMLMediaElement.prototype.canPlayType = function (type) {
        const lowerType = type.toLowerCase();

        // Individual blocks
        const disableAV1 = configRead('disableAV1');
        const disableVP9 = configRead('disableVP9');
        const disableAVC = configRead('disableAVC');
        const disableVP8 = configRead('disableVP8');
        const disableHEVC = configRead('disableHEVC');
        const disable60fps = configRead('disable60fps');

        if (disableAV1 && (lowerType.includes('av1') || lowerType.includes('av01'))) return '';
        if (disableVP9 && (lowerType.includes('vp9') || lowerType.includes('vp09'))) return '';
        if (disableAVC && (lowerType.includes('avc') || lowerType.includes('avc1'))) return '';
        if (disableVP8 && (lowerType.includes('vp8') || lowerType.includes('vp08'))) return '';
        if (disableHEVC && (lowerType.includes('hev') || lowerType.includes('hvc'))) return '';

        const fpsMatch = /framerate=(\d+)/.exec(lowerType) || /fps=(\d+)/.exec(lowerType);
        if (disable60fps && fpsMatch && parseInt(fpsMatch[1]) > 30) return '';

        return originalCanPlayType.call(this, type);
    };
}
