# moontime

Moon Time is a timekeeping system based on the lunar cycle. For more information, install the [chrome extension](https://chrome.google.com/webstore/detail/moon/pkmifcpdpojpgejapnpedemfpfddflee) or refer to [the website](https://moon.dynodel.com).

This library is an interface with moon time. It allows anyone to implement moon time into their project, in any environment.

**Features:**

- Smooth time syncing with the Moon API
- Cross converting between moon & solar time
- Moon time string formatting

## Installation

Add moon time to your project by including the `build/moontime.js` file.

Moon time isn't currently available via any package managers, but should be compatible with any JavaScript environment- browsers, node, etc.

## Usage

The simplest way to use moon time is to initialise it, add an event listener, and update the time on your clock when it fires.

```js
const moon = new Moon()

moon.addEventListener('update', function() {
    document.querySelector('.clock').innerHTML = moon.formatMoonString('Time: %MSP:%MMP:%MP %MdT %MeMT, %MAT, %MC')
})
```

This example also makes use of the `formatMoonString` function, which replaces `%`-prefixed codes with moon time values. It uses the current time by default.

### Syncing

Moontime automatically syncs to the Moon API. The time is initially calculated locally, based on the computer's time. Once a time is fetched from the API, the clock will slightly speed up or slow down until it matches. This is called 'smooth time', and can be adjusted in the settings.

The offset between the time given and the API time is updated twice per second, and can also be monitored with an event listener like so:

```js
moon.addEventListener('offset_update', function(e) {
    // The offset is measured in micro moon moments to 3dp
    document.querySelector('.offset').innerHTML = 'Offset: ' + e.offset
})
```

If the user's internet isn't connected or the API isn't working, the clock will remain on local time. You can be alerted when the status of the api connection changes.

```js
moon.addEventListener('api_status_update', function(e) {
    // This will fire for every attempted API request
    console.log('API connected:', e.connected)
})
```

### Settings

The settings object is accessible at `moon.settings`. Any value can be changed at any time.

| Setting              | Default | Description                                                                                                                           |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| smooth               | true    | On/off toggle for the 'smooth time' between local and API, off prevents any API requests                                              |
| smoothFactor         | 10      | Speed of smooth syncing, where smaller values sync faster but will change the speed of the clock more - recommended between 50 and 10 |
| smoothJumpLargeDiffs | true    | If large sync offsets (> 5 seconds) should be jumped, instead of making the clock change unnaturally fast                             |
| logAPIErrors         | false   | Whether to log API request errors in the console                                                                                      |
| fetchInterval        | 5000    | How often to send API requests for syncing (in ms)                                                                                    |

## Format Strings

The `formatMoonString()` function allows you to parse a string with keys that are swapped out with time values.

```js
moon.formatMoonString('Time: %MSP:%MMP:%MP %MdT %MeMT, %MAT, %MC')
// Will return something along the lines of:
// 04:10:45 10th Nathaniel, McDonough, 11
```

| Key   | Description                    |
| ----- | ------------------------------ |
| %m    | Micro Moon Moments             |
| %mP   | Micro Moon Moments, padded     |
| %M    | Mini Moon Moments              |
| %MP   | Mini Moon Moments, padded      |
| %MM   | Moon Moments                   |
| %MMP  | Moon Moments, padded           |
| %MS   | Moon Segments                  |
| %MSP  | Moon Segments, padded          |
| %Md   | Moon Days                      |
| %MdP  | Moon Days, padded              |
| %MdT  | Moon Days, suffixed (-st, -nd) |
| %MeM  | Mega Moon Moment               |
| %MeMT | Mega Moon Moment, by name      |
| %MA   | Moon Annual                    |
| %MAT  | Moon Annual, by name           |
| %MC   | Moon Chunk                     |

## Functions

If you're using Typescript, you probably don't need this :)

### solarToMoon(milliseconds: number): number

Convert a solar time to the equivalent moon time.

- milliseconds: solar time in unix milliseconds.
- *returns*: moon time in micro moon moments.

### moonToSolar(micromoments: number): number

Converts a moon time to the equivalent solar time.

- micromoments: moon time in micro moon moments.
- *returns*: solar time in unix milliseconds.

### now(): number

Calculates the current moon time, using the 'smooth' time if smooth time is enabled or the 'API' time, falling back to the 'local' time.

- *returns*: current moon time in micro moon moments.

### local(t?: number): number

Calculates a 'local' moon time based on the current device's clock.

- t: local process time to calculate the time for, defaults to the current time.
- *returns*: 'local' moon time in micro moon moments.

### smooth(t?: number): number

Calculates a 'smooth' moon time based on a smooth transition from the 'local' moon time to the latest 'API' moon time.

- t: local process time to calculate the time for, defaults to the current time.
- *returns*: 'smooth' moon time in micro moon moments.

### api(t?: number): number

Calculates an 'API' moon time based on the latest Moon API request data.

- t: local process time to calculate the time for, defaults to the current time.
- *returns*: 'API' moon time in micro moon moments.

### formatMoonTime(micromoments?: number): object

Formats the given moon time by breaking it down into the various time components and presenting them in useful ways.

- micromoments: moon time in micro moon moments, defaults to `moon.now()`.
- *returns*: an object with all of the moon time units in varying formats.

Formats the moon time provided. Returns an object with all the keys in the table under [Format Strings](#format-strings) and their corresponding values.

### formatMoonString(string: string, micromoments?: number): string

Formats the given moon time by inserting the respective components into the given format string. Refer to the above 'Format Strings' section or `Moon.FORMATS` for a reference of the available format keys.

- string: string to parse, replacing format keys with the moon time components.
- micromoments: moon time in micro moon moments, defaults to `moon.now()`.
- *returns*: parsed string.

### clock(format: string, callback: (string: string, time: number) => void): { now: () => string, dispose: () => void }

Creates a 'clock', which updates at a particular interval based on the given format string.
- format: string to format by.
- callback: function to call whenever the time given by the format string changes.
- *returns*: an object to dispose the clock if necessary.
