declare const moon: {
    const: {
        EPOCH: number;
        MICRO_MOMENT_LEN: number;
        MINI_MOMENT_LEN: number;
        API_ENDPOINT: string;
    };
    settings: {
        smooth: boolean;
        smoothFactor: number;
        smoothJumpLargeDiffs: boolean;
        logAPIErrors: boolean;
        fetchInterval: number;
    };
    _time: {
        _initialLocal: number;
        _initialMoon: number;
        _latestAPI: number;
        _latestAPIUpdate: number;
        _latestSmooth: number;
        _latestSmoothUpdate: number;
        _latestSmoothOffset: number;
        _latestSmoothOffsetUpdate: number;
    };
    now: (t?: number) => number;
    local: (t?: number) => number;
    smooth: (t?: number) => number;
    api: (t?: number) => number | undefined;
    init: (mode?: 'manual' | 'auto') => false | void;
    _updateSmooth: () => void;
    _fetchAPI: () => Promise<void>;
    formatMoonTime: (moon?: number) => {
        microMoonMoments: number;
        microMoonMomentsPadded: string;
        miniMoonMoments: number;
        miniMoonMomentsPadded: string;
        moonMoments: number;
        moonMomentsPadded: string;
        moonSegments: number;
        moonSegmentsPadded: string;
        moonDays: number;
        moonDaysPadded: string;
        moonDaysWithSuffix: string;
        megaMoonMoment: number;
        megaMoonMomentByName: string;
        moonAnnual: number;
        moonAnnualByName: string;
        moonChunk: number;
    };
    formatMoonString: (string: string, time?: number) => string;
};
