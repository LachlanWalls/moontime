# moontime


Moon Time is a timekeeping system based on the lunar cycle. A Chrome extension with more information can be found [here](https://chrome.google.com/webstore/detail/moon/pkmifcpdpojpgejapnpedemfpfddflee).

**This JavaScript library acts as an interface with moon time.** It allows anyone to implement moon time into their project, and has multiple features.

### Features

- Smooth time syncing with the Moon API.
- Moon & Solar time cross converting.
- Moon time & string formatting.

## Implementation

To implement moon time onto your website, simply add the following script in your head:

```html
<script src="https://cdn.jsdelivr.net/gh/eeehh/moontime@master/moontime.js"></script>
```

This will include moontime, which will automatically start up and start dispatching events whenever your clock should be updated.

**All functions and variables are accessed through the object named `moon`.**

If you don't want moontime to start automatically, you can start it manually. Add a 'delay_start' attribute to the script tag.

```html
<script src="https://cdn.jsdelivr.net/gh/eeehh/moontime@master/moontime.js" delay_start></script>
```

Moontime will now start once you execute the following script:

```js
moon.init()
```

## Usage

The simplest way to use moon time is to add an event listener, and once fired, update the time on your clock.

```js
window.addEventListener("moontime:updated", function(e) {
    document.querySelector(".clock").innerHTML = moon.formatMoonString("Time: %MS:%MM:%M %MdT %MeMT, %MAT, %MC")
})
```

This function also makes use of the formatMoonString function, which formats a time string and adds the times. It uses the current time by default, so is perfect for this application.

## Syncing

Moontime automatically syncs to Moon APIs. The time is initially calculated locally, based on the computer's time. Once a time is fetched from the API, the clock will slightly speed up or slow down until it matches. This feature can be modified (see Settings).

The offset between the time given and the API time is updated twice per second, and can also be monitored with an event listener like so.

```js
window.addEventListener("moontime:offset_updated", function(e) {
    // the offset is measured in micro moon moments (about 5 milliseconds), and can be retrieved in e.detail
    document.querySelector(".offset").innerHTML = "Offset: " + e.detail
})

// alternatively, you can manually fetch the sync offset yourself
document.querySelector(".offset").innerHTML = "Offset: " + moon._smoothOffset
```

If the user's internet isn't connected or the API is not working, syncing will not work and the clock will remain on local time. You can be alerted when the status of the api connection changes, using an event listener.

```js
window.addEventListener("moontime:api_status_updated", function(e) {
    if (e.detail) {
        // sync is working
    } else {
        // sync is not working
    }
})
```


## Settings

The settings object is accessible at `moon.settings`. Any value can be changed at any time.

Setting | Default | Description
------- | ------- | -----------
smooth_sync | true | Determines if smooth syncing should be used (see Syncing). If not, the time will occasionally jump to update when the API time is fetched.
smooth_factor | 10 | The factor of smooth syncing. Smaller factors sync faster, but will change the speed of the clock more. The recommended range is between 50 and 10.
jump_large_diffs | true | Determines if large sync offsets ( > 5 seconds) should be jumped. Very large offsets will make the clock change at an unnaturally fast speed.
log_api_errors | true | Determines if errors in fetching from the API should be logged in the console.
fetchinterval | 5000 | How often moontime should fetch from the API in milliseconds.


## Format Strings

The `formatMoonString()` function allows you to parse a string with keys that are swapped out with time values.

```js
moon.formatMoonString("Time: %MS:%MM:%M %MdT %MeMT, %MAT, %MC")
// will return something along the lines of:
// 04:10:45 10th Nathaniel, McDonough, 11
```

Key | Description
--- | -----------
%m | Micro Moon Moments
%M | Mini Moon Moments
%MM | Moon Moments
%MS | Moon Segments
%Md | Moon Days
%MdT | Moon Days + Suffix (st, nd, rd)
%MeM | Mega Moon Moments
%MeMT | Mega Moon Moments (by name)
%MA | Moon Annuals
%MAT | Moon Annuals (by name)
%MC | Moon Chunks


## Functions
### solarToMoon(millis)

- millis: time in milliseconds, counting from midnight of Jan 1st, 1970.

Converts a time from Solar to Moon. The milliseconds parsed can be calculated with `Date.getTime()`.

### moonToSolar(micro_moments)

- micro_moments: time in micro moon moments.

Converts a time from Moon to Solar.

### currentExactTime()

Returns the current moon time according to the Moon API.

### currentLocalTime()

Returns the current moon time according to the local computer clock.

### currentSmoothTime()

Returns the current smooth moon time. Smooth moon time is used to transition from the initial local time and sync up to the API time without the clock jumping back or forwards.

### currentTime()

Returns the current moon time. Will return exact or smooth time depending on the 'smooth_sync' setting. You should only really need to use this function when fetching the time.

### formatMoonTime(micro_moments)

- micro_moments: time in micro moon moments to format. **defaults to current time**

Formats the moon time provided and returns an object with all the keys in the table under 'Format Strings'.

### formatMoonString(format_string, micro moments)

- format_string: the string in which to look for keys to replace with times, and then return.
- micro_moments: time in micro moon moments to insert into string. **defaults to current time**

Reformats the provided string, replacing all keys with certain values based on the current moon time. See 'Format Strings'.

### init()

Used to initialize the moontime library, if the `delay_start` attribute is provided on the script tag to stop automatic initializing.


## Examples
example.html demonstrates a simple set up of moon time.


## Contributing
You want to contribute? Ok cool, go for it.

