let myclock = build_digital("Current solar time: %YYYY/%MM/%DD %h12:%mm:%ss")
myclock.attach(document.querySelector("#s"))

window.addEventListener('newtime', function(e) {
    let time = clockCore.now


})