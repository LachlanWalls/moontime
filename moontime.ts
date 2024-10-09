export interface MoonSettings {
  /** On/off toggle for the 'smooth time' between local and API, off prevents any API requests @default true */
  smooth: boolean
  /** Speed of smooth syncing, where smaller values sync faster but will change the speed of the clock more - recommended between 50 and 10 @default 10 */
  smoothFactor: number
  /** If large sync offsets (> 5 seconds) should be jumped, instead of making the clock change unnaturally fast @default true */
  smoothJumpLargeDiffs: boolean
  /** Whether to log API request errors in the console @default false */
  logAPIErrors: boolean
  /** How often to send API requests for syncing (in ms) @default 5000 */
  fetchInterval: 5000
}

export class Moon extends EventTarget {
  static EPOCH = 413596800000
  static MICRO_MOMENT_LEN = 4.917875
  static API_ENDPOINT = 'https://api.dynodel.com/moon/v2'
  static FORMATS = [
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
  ] as const

  settings: MoonSettings = {
    smooth: true,
    smoothFactor: 10,
    smoothJumpLargeDiffs: true,
    logAPIErrors: false,
    fetchInterval: 5000
  }

  private _time = {
    _initialLocal: -1,
    _initialMoon: -1,
    _latestAPI: -1,
    _latestAPIUpdate: -1,
    _latestSmooth: -1,
    _latestSmoothUpdate: -1,
    _latestSmoothOffset: -1,
    _latestSmoothOffsetUpdate: -1
  }

  constructor (settings: Partial<MoonSettings> = {}) {
    super()

    this.settings = Object.assign(this.settings, settings)

    this._time._initialLocal = performance.now()
    this._time._initialMoon = this.solarToMoon(Date.now())
    this._time._latestSmoothUpdate = performance.now()
    this._time._latestSmooth = this.local(this._time._latestSmoothUpdate)

    setTimeout(this._updateSmooth.bind(this), Moon.MICRO_MOMENT_LEN * 200)

    setInterval(() => {
      const t = performance.now(), api = this.api(t)
      const offset = api ? api - this.smooth(t) : undefined
      
      if (offset) {
        this._time._latestSmoothOffset = offset
        this._time._latestSmoothOffsetUpdate = t
        this.dispatchEvent(new MoonOffsetUpdateEvent(Math.round(offset * 1000) / 1000))
      }
    }, 500)

    this._fetchAPI()
  }

  /**
   * Calculates the current moon time, using the 'smooth' time if smooth time is enabled or the 'API' time, falling back to the 'local' time.
   * @returns current moon time in micro moon moments.
   */
  now () { return this.settings.smooth ? this.smooth() : (this.api() || this.local()) }

  /**
   * Calculates a 'local' moon time based on the current device's clock.
   * @param t local process time to calculate the time for, defaults to the current time.
   * @returns 'local' moon time in micro moon moments.
   */
  local (t: number = performance.now()) { return this._time._initialMoon + (t - this._time._initialLocal) / Moon.MICRO_MOMENT_LEN }
  
  /**
   * Calculates a 'smooth' moon time based on a smooth transition from the 'local' moon time to the latest 'API' moon time.
   * @param t local process time to calculate the time for, defaults to the current time.
   * @returns 'smooth' moon time in micro moon moments.
   */
  smooth (t: number = performance.now()) { return this._time._latestSmooth + (t - this._time._latestSmoothUpdate) / Moon.MICRO_MOMENT_LEN }

  /**
   * Calculates an 'API' moon time based on the latest Moon API request data.
   * @param t local process time to calculate the time for, defaults to the current time.
   * @returns 'API' moon time in micro moon moments, or null if unavailable.
   */
  api (t: number = performance.now()) { return this._time._latestAPI === -1 ? null : this._time._latestAPI + (t - this._time._latestAPIUpdate) / Moon.MICRO_MOMENT_LEN }

  /**
   * Convert a solar time to the equivalent moon time.
   * @param milliseconds solar time in unix milliseconds.
   * @returns moon time in micro moon moments.
   */
  solarToMoon (milliseconds: number) { return (milliseconds - Moon.EPOCH) / Moon.MICRO_MOMENT_LEN }

  /**
   * Converts a moon time to the equivalent solar time.
   * @param micromoments moon time in micro moon moments.
   * @returns solar time in unix milliseconds.
   */
  moonToSolar (micromoments: number) { return micromoments * Moon.MICRO_MOMENT_LEN + Moon.EPOCH }

  private _updateSmooth () {
    const start = performance.now()

    if (this._time._latestAPI !== -1) {
      const offset = this.api()! - this.smooth(), prevSmoothUpdate = this._time._latestSmoothUpdate
      this._time._latestSmoothUpdate = performance.now()
      if (offset > 1000 && this.settings.smoothJumpLargeDiffs) this._time._latestSmooth = this.api(this._time._latestSmoothUpdate)!
      else this._time._latestSmooth = this._time._latestSmooth + (this._time._latestSmoothUpdate - prevSmoothUpdate) / Moon.MICRO_MOMENT_LEN + offset / this.settings.smoothFactor
    } else {
      this._time._latestSmoothUpdate = performance.now()
      this._time._latestSmooth = this.local(this._time._latestSmoothUpdate)
    }

    setTimeout(this._updateSmooth.bind(this), Moon.MICRO_MOMENT_LEN * 200 - (performance.now() - start) - 10)
    this.dispatchEvent(new MoonUpdateEvent(this.now()))
  }

  private async _fetchAPI () {
    if (this.settings.smooth) {
      try {
        const send = performance.now()
        const res = await fetch(Moon.API_ENDPOINT).then(res => res.json() as Promise<{ local_m: number, exec_m: number }>)
        const receive = performance.now()
        const duration = (receive - send) / Moon.MICRO_MOMENT_LEN
        if (res.local_m === undefined || isNaN(res.local_m) || res.exec_m === undefined || isNaN(res.exec_m)) throw new Error('Invalid response: ' + res)

        this._time._latestAPI = res.local_m + (duration - res.exec_m) / 2
        this._time._latestAPIUpdate = receive
        this.dispatchEvent(new MoonAPIStatusUpdateEvent(true))
      } catch (e) {
        this._time._latestAPI = -1
        if (this.settings.logAPIErrors) console.error(e)
        this.dispatchEvent(new MoonAPIStatusUpdateEvent(false))
      }
    }

    setTimeout(this._fetchAPI.bind(this), this.settings.fetchInterval)
  }

  /**
   * Formats the given moon time by breaking it down into the various time components and presenting them in useful ways.
   * @param micromoments moon time in micro moon moments, defaults to `moon.now()`.
   * @returns an object with all of the moon time units in varying formats.
   */
  formatMoonTime (micromoments?: number) {
    let microMoonMoments = micromoments || this.now()
    let miniMoonMoments = Math.floor(microMoonMoments / 200)
    microMoonMoments = microMoonMoments - miniMoonMoments * 200
    let moonMoments = Math.floor(miniMoonMoments / 100)
    miniMoonMoments = miniMoonMoments - moonMoments * 100
    let moonSegments = Math.floor(moonMoments / 40)
    moonMoments = moonMoments - moonSegments * 40
    let moonDays = Math.floor(moonSegments / 10)
    moonSegments = moonSegments - moonDays * 10 + 1
    let megaMoonMoment = Math.floor(moonDays / 59)
    moonDays = moonDays - megaMoonMoment * 59 + 1
    let moonAnnual = Math.floor(megaMoonMoment / 4)
    megaMoonMoment = megaMoonMoment - moonAnnual * 4 + 1
    let moonChunk = Math.floor(moonAnnual / 11)
    moonAnnual = moonAnnual - moonChunk * 11 + 1

    const suffixes = ['th', 'st', 'nd', 'rd'] as const, v = moonDays % 100
    const moonDaysWithSuffix = moonDays + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
    const megaMoonMomentByName = ['McCartney', 'Glenn', 'Nathaniel', 'Rolf'][megaMoonMoment - 1]!
    const moonAnnualByName = ['McDonough', 'Lovell', 'Zielle', 'Schlenker', 'Hills', 'Richards', 'Francesconi', 'Pietsch', 'Wakeford', 'Blake', 'Green'][moonAnnual - 1]!

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
    }
  }

  /**
   * Formats the given moon time by inserting the respective components into the given format string. Refer to the README or `Moon.FORMATS` for a reference of the available format keys.
   * @param string string to parse, replacing format keys with the moon time components.
   * @param micromoments moon time in micro moon moments, defaults to `moon.now()`.
   * @returns parsed string.
   */
  formatMoonString (string: string, micromoments?: number) {
    const formatted = this.formatMoonTime(micromoments)
    return Moon.FORMATS.reduceRight((s, [k, v]) => s.replaceAll(`%${v}`, String(formatted[k])), string)
  }
}

/** Event to indicate that the moon time has updated, dispatched every mini moon moment. */
export class MoonUpdateEvent extends Event {
  constructor (public time: number) {
    super('update')
  }
}

/** Event to indicate that the moon time offset has updated, dispatched at the same frequency as main updates. */
export class MoonOffsetUpdateEvent extends Event {
  constructor (public offset: number) {
    super('offset_update')
  }
}

/** Event to indicate the status of API connectivity, dispatched after every attempted request. */
export class MoonAPIStatusUpdateEvent extends Event {
  constructor (public connected: boolean) {
    super('api_status_update')
  }
}

export declare interface Moon {
  addEventListener(type: 'update', callback: ((evt: MoonUpdateEvent) => void) | null | EventListenerObject, options?: AddEventListenerOptions | boolean): void
  addEventListener(type: 'offset_update', callback: ((evt: MoonOffsetUpdateEvent) => void) | null | EventListenerObject, options?: AddEventListenerOptions | boolean): void
  addEventListener(type: 'api_status_update', callback: ((evt: MoonAPIStatusUpdateEvent) => void) | null | EventListenerObject, options?: AddEventListenerOptions | boolean): void
}
