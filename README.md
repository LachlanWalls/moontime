# moontime


Moon Time is a timekeeping system based on the lunar cycle. A Chrome extension with more information can be found [here](https://chrome.google.com/webstore/detail/moon/pkmifcpdpojpgejapnpedemfpfddflee).

This TS/JS library is an interface with moon time. It allows anyone to implement moon time into their project.

**Features:**

- Smooth time syncing with the Moon API
- Cross converting between moon & solar time
- Moon time string formatting

## Installation

Add moon time to your website by including the `build/moontime.js` file. Either add it to your project directly or include via a site like jsdelivr.

As soon as the script is loaded, it will automatically start tracking moon time and dispatching timekeeping events via `window`.

If you don't want moontime to start automatically, you can start it manually. Add a 'delay_start' attribute to the script tag.

```html
<script src='./moontime.js' delay_start></script>
```

Moontime will now only start once you execute the following script:

```js
moon.init()
```

## Usage

The simplest way to use moon time is to add an event listener, and once fired, update the time on your clock.

```js
window.addEventListener('moontime:updated', function() {
    document.querySelector('.clock').innerHTML = moon.formatMoonString('Time: %MSP:%MMP:%MP %MdT %MeMT, %MAT, %MC')
})
```

This function makes use of the `formatMoonString` function, which replaces `%`-prefixed codes with moon time values. It uses the current time by default.

## Syncing

Moontime automatically syncs to the Moon API. The time is initially calculated locally, based on the computer's time. Once a time is fetched from the API, the clock will slightly speed up or slow down until it matches. This is called 'smooth time', and can be adjusted in the settings.

The offset between the time given and the API time is updated twice per second, and can also be monitored with an event listener like so:

```js
window.addEventListener('moontime:offset_updated', function(e) {
    // The offset is measured in micro moon moments to 3dp
    document.querySelector('.offset').innerHTML = 'Offset: ' + e.detail
})

// Alternatively, you can manually fetch the sync offset yourself
document.querySelector('.offset').innerHTML = 'Offset: ' + moon._time._latestSmoothOffset
```

If the user's internet isn't connected or the API isn't working, the clock will remain on local time. You can be alerted when the status of the api connection changes, using an event listener.

```js
window.addEventListener('moontime:api_status_updated', function(e) {
    // This will fire for every attempted API request
    console.log('API connected:', e.detail.connected)
})
```

## Settings

The settings object is accessible at `moon.settings`. Any value can be changed at any time.

| Setting              | Default | Description                                                                                                                         |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| smooth               | true    | On/off toggle for the 'smooth time' between local and API time                                                                      |
| smoothFactor         | 10      | The speed of smooth syncing. Smaller values sync faster, but will change the speed of the clock more. Recommended between 50 and 10 |
| smoothJumpLargeDiffs | true    | Determines if large sync offsets (> 5 seconds) should be jumped, instead of making the clock change unnaturally fast                |
| logAPIErrors         | false   | Controls if API request errors will be logged in the console                                                                        |
| fetchInterval        | 5000    | How frequently the API sync should be requested (in milliseconds)                                                                   |


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

### solarToMoon(milliseconds: number)

- milliseconds: unix time in milliseconds

Converts a time from solar to moon.

### moonToSolar(micromoments: number)

- micromoments: moon time in micro moon moments

Converts a time from moon to solar.

### now()

Returns the current moon time. Will return local or smooth time depending on the 'smooth' setting.

### local()

Returns the current moon time according to the local computer clock.

### smooth()

Returns the current smooth moon time.

### api()

Returns the current moon time according to the Moon API.

### formatMoonTime(micromoments?: number)

- micromoments: moon time in micro moon moments, defaults to current time

Formats the moon time provided. Returns an object with all the keys in the table under [Format Strings](#format-strings) and their corresponding values.

### formatMoonString(string: string, time?: number)

- string: the string to format
- time: moon time in micro moon moments, defaults to current time

Reformats the provided string, replacing all the keys with the corresponding moon time values based on the provided time. See [Format Strings](#format-strings).

### init()

Used to initialize the moontime library, if the `delay_start` attribute is provided on the script tag to stop automatic initializing.
