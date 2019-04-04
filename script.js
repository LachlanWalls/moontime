let myclock = build_digital("Current solar time: %YYYY/%MM/%DD %h12:%mm:%ss")
myclock.attach(document.querySelector("#s"))

function getmoon() {

    let time = new Date()
    let millis_1970 = time.getTime()
    let millis_0000 = 62136914400000 + millis_1970

    let moon_m = millis_0000 / 4.97875

    let moon_M = Math.floor(moon_m / 200)
    moon_m = moon_m - Math.floor(moon_m / 200) * 200

    let moon_MM = Math.floor(moon_M / 100)
    moon_M = moon_M - Math.floor(moon_M / 100) * 100

    let moon_MS = Math.floor(moon_MM / 40)
    moon_MM = moon_MM - Math.floor(moon_MM / 40) * 40

    let moon_Md = Math.floor(moon_MS / 10)
    moon_MS = moon_MS - Math.floor(moon_MS / 10) * 10

    let moon_MeM = Math.floor(moon_Md / 59)
    moon_Md = moon_Md - Math.floor(moon_Md / 59) * 59

    let moon_MA = Math.floor(moon_MeM / 4)
    moon_MeM = moon_MeM - Math.floor(moon_MeM / 4) * 4

    let moon_MC = Math.floor(moon_MA / 11)
    moon_MA = moon_MA - Math.floor(moon_MA / 11) * 11

    document.querySelector("#m").innerHTML = "Current moon time: " + moon_MC + "/" + moon_MA + "/" + moon_MeM + "/" + moon_Md + " " + moon_MS + ":" + moon_MM + ":" + moon_M
}

window.setInterval(getmoon, 983)