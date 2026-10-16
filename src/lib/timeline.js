/*
 * A tiny scrubbed timeline: named numeric tracks, each a list of eased segments on one shared clock.
 * `sample(t)` is a pure function of time, so scrubbing forwards, backwards or jumping anywhere is
 * exact. It replaces a general animation library for this page (a few hundred bytes instead of ~70 KB).
 */
export const ease = {
    linear: (t) => t,
    /** power ease-in: k = 2 quad, 3 cubic, 4 quart */
    in: (k) => (t) => Math.pow(t, k),
    out: (k) => (t) => 1 - Math.pow(1 - t, k),
    inOut: (k) => (t) => t < 0.5 ? 0.5 * Math.pow(2 * t, k) : 1 - 0.5 * Math.pow(2 * (1 - t), k),
};
export class Timeline {
    tracks = new Map();
    initial;
    /** total length in timeline units */
    duration = 0;
    constructor(initial) {
        this.initial = initial;
        for (const key of Object.keys(initial))
            this.tracks.set(key, []);
    }
    /** Tween `key` to `value` starting at `at` for `dur` units (starts from wherever the track last ended). */
    to(key, value, at, dur, easing = ease.inOut(3)) {
        const segs = this.tracks.get(key);
        const last = segs[segs.length - 1];
        segs.push({ t0: at, t1: at + dur, from: last ? last.to : this.initial[key], to: value, ease: easing });
        this.duration = Math.max(this.duration, at + dur);
        return this;
    }
    /** Make the timeline at least this long (a held final frame). */
    holdUntil(t) {
        this.duration = Math.max(this.duration, t);
        return this;
    }
    /** Write every track's value at time `t` into `out`. */
    sample(t, out) {
        for (const [key, segs] of this.tracks) {
            let v = this.initial[key];
            for (let i = 0; i < segs.length; i++) {
                const s = segs[i];
                if (t >= s.t1)
                    v = s.to;
                else if (t > s.t0)
                    v = s.from + (s.to - s.from) * s.ease((t - s.t0) / (s.t1 - s.t0));
                else
                    break;
            }
            out[key] = v;
        }
    }
}
