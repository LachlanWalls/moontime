"use strict";
const moon = {
    const: {
        EPOCH: 413596800000,
        MICRO_MOMENT_LEN: 4.917875,
        MINI_MOMENT_LEN: 4.917875 * 200,
        API_ENDPOINT: 'https://api.dynodel.com/moon'
    },
    settings: {
        smooth: true,
        smoothFactor: 10,
        smoothJumpLargeDiffs: true,
        logAPIErrors: false,
        fetchInterval: 5000
    },
    _time: {
        _initialLocal: -1,
        _initialMoon: -1,
        _latestAPI: -1,
        _latestAPIUpdate: -1,
        _latestSmooth: -1,
        _latestSmoothUpdate: -1,
        _latestSmoothOffset: -1,
        _latestSmoothOffsetUpdate: -1
    },
    now: function (t) { return this.settings.smooth ? this.smooth(t) : this.api(t) || this.local(t); },
    local: function (t = performance.now()) { return this._time._initialMoon + (t - this._time._initialLocal) / this.const.MICRO_MOMENT_LEN; },
    smooth: function (t = performance.now()) { return this._time._latestSmooth + (t - this._time._latestSmoothUpdate) / this.const.MICRO_MOMENT_LEN; },
    api: function (t = performance.now()) { return this._time._latestAPI === -1 ? undefined : this._time._latestAPI + (t - this._time._latestAPIUpdate) / this.const.MICRO_MOMENT_LEN; },
    init: function (mode = 'manual') {
        const scripts = document.querySelectorAll('script');
        const script = Array.from(scripts).find(s => s.src.indexOf('moontime.js') > -1 && s.getAttribute('delay_start') !== null);
        if (script && mode === 'auto')
            return false;
        this._time._initialLocal = performance.now();
        this._time._initialMoon = (Date.now() - this.const.EPOCH) / this.const.MICRO_MOMENT_LEN;
        this._time._latestSmoothUpdate = performance.now();
        this._time._latestSmooth = this.local(this._time._latestSmoothUpdate);
        window.setTimeout(this._updateSmooth.bind(this), this.const.MINI_MOMENT_LEN);
        window.setInterval(() => {
            const t = performance.now(), api = this.api(t);
            const offset = api ? api - this.smooth(t) : undefined;
            if (offset) {
                this._time._latestSmoothOffset = offset;
                this._time._latestSmoothOffsetUpdate = t;
                window.dispatchEvent(new CustomEvent('moontime:offset_updated', { detail: Math.round(offset * 1000) / 1000 }));
            }
        }, 500);
        moon._fetchAPI();
    },
    _updateSmooth: function () {
        const start = performance.now();
        if (this._time._latestAPI !== -1) {
            const offset = this.api() - this.smooth(), prevSmoothUpdate = this._time._latestSmoothUpdate;
            this._time._latestSmoothUpdate = performance.now();
            if (offset > 1000 && this.settings.smoothJumpLargeDiffs)
                this._time._latestSmooth = this.api(this._time._latestSmoothUpdate);
            else
                this._time._latestSmooth = this._time._latestSmooth + (this._time._latestSmoothUpdate - prevSmoothUpdate) / this.const.MICRO_MOMENT_LEN + offset / this.settings.smoothFactor;
        }
        else {
            this._time._latestSmoothUpdate = performance.now();
            this._time._latestSmooth = this.local(this._time._latestSmoothUpdate);
        }
        window.setTimeout(this._updateSmooth.bind(this), this.const.MINI_MOMENT_LEN - (performance.now() - start) - 10);
        window.dispatchEvent(new CustomEvent('moontime:updated', { detail: this.now() }));
    },
    _fetchAPI: async function () {
        try {
            const res = await fetch(this.const.API_ENDPOINT).then(res => res.text());
            const [time, relativeMoon] = res.split(':').map(Number);
            if (time === undefined || isNaN(time) || relativeMoon === undefined || isNaN(relativeMoon))
                throw new Error('Invalid response: ' + res);
            this._time._latestAPI = relativeMoon - (Date.now() - time) / this.const.MICRO_MOMENT_LEN;
            this._time._latestAPIUpdate = performance.now();
            window.dispatchEvent(new CustomEvent('moontime:api_status_update', { detail: { connected: true } }));
        }
        catch (e) {
            this._time._latestAPI = -1;
            if (this.settings.logAPIErrors)
                console.error(e);
            window.dispatchEvent(new CustomEvent('moontime:api_status_update', { detail: { connected: false } }));
        }
        window.setTimeout(this._fetchAPI.bind(this), this.settings.fetchInterval);
    },
    formatMoonTime: function (moon) {
        let microMoonMoments = moon || this.now();
        let miniMoonMoments = Math.floor(microMoonMoments / 200);
        microMoonMoments = microMoonMoments - miniMoonMoments * 200;
        let moonMoments = Math.floor(miniMoonMoments / 100);
        miniMoonMoments = miniMoonMoments - moonMoments * 100;
        let moonSegments = Math.floor(moonMoments / 40);
        moonMoments = moonMoments - moonSegments * 40;
        let moonDays = Math.floor(moonSegments / 10);
        moonSegments = moonSegments - moonDays * 10 + 1;
        let megaMoonMoment = Math.floor(moonDays / 59);
        moonDays = moonDays - megaMoonMoment * 59 + 1;
        let moonAnnual = Math.floor(megaMoonMoment / 4);
        megaMoonMoment = megaMoonMoment - moonAnnual * 4 + 1;
        let moonChunk = Math.floor(moonAnnual / 11);
        moonAnnual = moonAnnual - moonChunk * 11 + 1;
        const suffixes = ['th', 'st', 'nd', 'rd'], v = moonDays % 100;
        const moonDaysWithSuffix = moonDays + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
        const megaMoonMomentByName = ['McCartney', 'Glenn', 'Nathaniel', 'Rolf'][megaMoonMoment - 1];
        const moonAnnualByName = ['McDonough', 'Lovell', 'Zielle', 'Schlenker', 'Hills', 'Richards', 'Francesconi', 'Pietsch', 'Wakeford', 'Blake', 'Green'][moonAnnual - 1];
        return {
            microMoonMoments,
            microMoonMomentsPadded: String(microMoonMoments).padStart(3, '0'),
            miniMoonMoments,
            miniMoonMomentsPadded: String(miniMoonMoments).padStart(2, '0'),
            moonMoments,
            moonMomentsPadded: String(moonMoments).padStart(2, '0'),
            moonSegments,
            moonSegmentsPadded: String(moonSegments).padStart(2, '0'),
            moonDays,
            moonDaysPadded: String(moonDays).padStart(2, '0'),
            moonDaysWithSuffix,
            megaMoonMoment,
            megaMoonMomentByName,
            moonAnnual,
            moonAnnualByName,
            moonChunk
        };
    },
    formatMoonString: function (string, time) {
        const formatted = this.formatMoonTime(time);
        const formats = [
            ['microMoonMoments', 'm'],
            ['microMoonMomentsPadded', 'mP'],
            ['miniMoonMoments', 'M'],
            ['miniMoonMomentsPadded', 'MP'],
            ['moonMoments', 'MM'],
            ['moonMomentsPadded', 'MMP'],
            ['moonSegments', 'MS'],
            ['moonSegmentsPadded', 'MSP'],
            ['moonDays', 'Md'],
            ['moonDaysPadded', 'MdP'],
            ['moonDaysWithSuffix', 'MdT'],
            ['megaMoonMoment', 'MeM'],
            ['megaMoonMomentByName', 'MeMT'],
            ['moonAnnual', 'MA'],
            ['moonAnnualByName', 'MAT'],
            ['moonChunk', 'MC']
        ];
        return formats.reduceRight((s, [k, v]) => s.split(`%${v}`).join(String(formatted[k])), string);
    }
};
moon.init('auto');
//# sourceMappingURL=moontime.js.map