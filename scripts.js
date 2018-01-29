var audioCtx = new (window.AudioContext || window.webkitAudioContext)()
var source

var audioData
function loadAudio(callback) {
    if (audioData) return audioData
    var request = new XMLHttpRequest()
    request.open('GET', 'sound.m4a', true)
    request.responseType = 'arraybuffer'
    request.onload = function() {
        var audioData = request.response
        callback(audioData)
    }
    request.send()
}

function syncAudioTrack(time, video) {
    if (source) {
        source.stop()
        newSource = audioCtx.createBufferSource()
        loadAudio(function(audioData) {
            audioCtx.decodeAudioData(audioData, function(buffer) {
                newSource.buffer = buffer
                newSource.connect(audioCtx.destination)
                newSource.loop = true
                source = newSource
                source.start(0, time)
                $('video')[0].currentTime = time
            }, function(e) {
                console.log('Error decoding audio data' + e.err)
            })
        })
    } else {
        source = audioCtx.createBufferSource()
        loadAudio(function(audioData) {
            console.log(audioData)
            audioCtx.decodeAudioData(audioData, function(buffer) {
                source.buffer = buffer
                source.connect(audioCtx.destination)
                source.loop = true
                source.start(0, time)
                $('video')[0].currentTime = time
            }, function(e) {
                console.log('Error decoding audio data' + e.err)
            })
        })
    }
}

function iOS() {

    var iDevices = [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ];

    if (!!navigator.platform) {
        while (iDevices.length) {
            if (navigator.platform === iDevices.pop()) { return true; }
        }
    }

    return false;
}

$(document).ready(function () {

    // Insert video muted if mobile, playing if desktop
    if (true/*iOS()*/) {
        $('body').prepend('<video playsinline loop autoplay muted><source src="outwest.mp4" type="video/mp4"></video>')
        syncAudioTrack(0)
    } else {
        $('body').prepend('<video playsinline loop autoplay><source src="outwest.mp4" type="video/mp4"></video>')
    }
    $("video").on(
        "timeupdate",
        function (event) {
            //console.log(this.currentTime / this.duration);
            var percent = (this.currentTime / this.duration);
            if (percent < .85) {
                $('#head').css({ right: (percent * 100) + "%" });
            }
        });

    $('#head').on('mousedown', function (e) {
        var node = $(this);
        var position = node.offset();
        var initialized = {
            x: position.left - e.pageX,
        };
        var headPos
        var handlers = {
            mousemove: function (e) {
                node.css({
                    left: (initialized.x + e.pageX) + 'px',
                });
                headPos = e.clientX / $(window).width();
            },
            mouseup: function (e) {
                $(this).off(handlers);
                $('#head').css({ left: 'auto' });
                $('video')[0].currentTime = (1 - headPos) * $('video')[0].duration;
            }
        };
        $(document).on(handlers);

    });

    $('#head').on('touchstart', function (e) {
        console.log('head tap');
        var node = $(this);
        var position = node.offset();
        var initialized = {
            x: position.left - e.pageX,
        };
        var headPos
        var touchHandlers = {
            touchmove: function (e) {
                headPos = e.targetTouches[0].clientX / $(window).width();
                node.css({
                    left: (initialized.x + e.pageX) + 'px',
                });
            },
            touchend: function (e) {
                $(this).off(touchHandlers);
                $('#head').css({ left: 'auto' });
                if (source) syncAudioTrack((1 - headPos) * $('video')[0].duration)
            }
        };
        $(document).on(touchHandlers);
    });

});