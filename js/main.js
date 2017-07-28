/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* global AudioContext, SoundMeter */

'use strict';
//keycodes are 111 - divide - and 106 - multiply
var instantMeter = document.querySelector('#instant meter');
var slowMeter = document.querySelector('#slow meter');
var clipMeter = document.querySelector('#clip meter');

var instantValueDisplay = document.querySelector('#instant .value');
var slowValueDisplay = document.querySelector('#slow .value');
var clipValueDisplay = document.querySelector('#clip .value');
var lastPolledInstant= Date.now();
var lastShoutedInstant= Date.now();
var expressing=false;

// hook message constants
var HOOK_MESSAGE_TYPE = {
    WM_KEYDOWN    : 0x0100,
    WM_KEYUP    : 0x0101,
    WM_SYSKEYDOWN : 0x0104,
    WM_SYSKEYUP   : 0x0105,
    WM_LBUTTONDOWN  : 0x0201,
    WM_LBUTTONUP  : 0x0202,
    WM_MOUSEMOVE  : 0x0200,
    WM_MOUSEWHEEL : 0x020A,
    WM_MOUSEHWHEEL  : 0x020E,
    WM_RBUTTONDOWN  : 0x0204,
    WM_RBUTTONUP  : 0x0205,
    WM_MBUTTONDOWN  : 0x0207,
    WM_MBUTTONUP  : 0x0208
};

try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audioContext = new AudioContext();
} catch (e) {
    alert('Web Audio API not supported.');
}

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
    audio: true,
    video: false
};

function handleSuccess(stream) {
    // Put variables in global scope to make them available to the
    // browser console.
    window.stream = stream;
    var soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
    soundMeter.connectToSource(stream, function(e) {
        if (e) {
            alert(e);
            return;
        }
        setInterval(function() {
            instantMeter.value = instantValueDisplay.innerText =
                soundMeter.instant.toFixed(2);
            slowMeter.value = slowValueDisplay.innerText =
                soundMeter.slow.toFixed(2);
            clipMeter.value = clipValueDisplay.innerText =
                soundMeter.clip;
            if (instantMeter.value < .03 && ((Date.now() - lastShoutedInstant > 1000))&& !expressing){
                if ((Date.now() - lastPolledInstant) > 500){
                    document.getElementById('talkingPic')
                        .innerHTML = '<img src="idle.png" />';
                }
            }
            if (instantMeter.value > .03 && ((Date.now() - lastShoutedInstant > 1000)) && !expressing){
                document.getElementById('talkingPic')
                    .innerHTML = '<img src="talking.png" />';
                lastPolledInstant=Date.now();
            }
            if (instantMeter.value > .4 && !expressing){
                document.getElementById('talkingPic')
                    .innerHTML = '<img src="shouting.png" />';
                lastPolledInstant=Date.now();
                lastShoutedInstant=Date.now();
            }
            if(((Date.now() - lastShoutedInstant) < 1000) && ((Date.now() - lastShoutedInstant) > 500 ) && !expressing){
                document.getElementById('talkingPic')
                    .innerHTML = '<img src="recovering.png" />';
                lastPolledInstant=Date.now();
            }
        }, 200);
    });
}

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

external.LoadDll('Scriptdlls\\SplitmediaLabs\\XjsEx.dll');
external.CallDllEx('xsplit.HookSubscribe');

window.OnDllOnInputHookEvent = function(msg, wparam, lparam){
    switch (parseInt(msg)) {
        case HOOK_MESSAGE_TYPE.WM_KEYDOWN:
        case HOOK_MESSAGE_TYPE.WM_SYSKEYDOWN:
            console.log("Keystroke received: "+wparam);
            if(wparam==111){
                expressing=true;
                document.getElementById('talkingPic')
                    .innerHTML = '<img src="1.png" />';
            }
            if(wparam==106){
                expressing=true;
                document.getElementById('talkingPic')
                    .innerHTML = '<img src="2.png" />';
            }
            break;
        case HOOK_MESSAGE_TYPE.WM_KEYUP:
        case HOOK_MESSAGE_TYPE.WM_SYSKEYUP:
            if(wparam==111){
                expressing=false;
            }
            if(wparam==106){
                expressing=false;
            }
            break;
    }
};

// function handleKeydown(wparam, lparam){
//     if(wparam==111){
//             expressing=true;
//             document.getElementById('talkingPic')
//                 .innerHTML = '<img src="1.png" />';
//         }
//     if(wparam==106){
//         expressing=true;
//         document.getElementById('talkingPic')
//             .innerHTML = '<img src="2.png" />';
//     }
// }
//
// function handleKeyup(wparam, lparam){
//     if(wparam==111){
//         expressing=false;
//     }
//     if(wparam==106){
//         expressing=false;
//     }
// }

navigator.mediaDevices.getUserMedia(constraints).
then(handleSuccess).catch(handleError);