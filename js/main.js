/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* global AudioContext, SoundMeter */

'use strict';

var talkingPic = document.querySelector('#talkingpic div');
var instantMeter = document.querySelector('#instant meter');
var slowMeter = document.querySelector('#slow meter');
var clipMeter = document.querySelector('#clip meter');

var instantValueDisplay = document.querySelector('#instant .value');
var slowValueDisplay = document.querySelector('#slow .value');
var clipValueDisplay = document.querySelector('#clip .value');
var lastPolledInstant= Date.now();
var lastShoutedInstant;

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
            if (instantMeter.value < .03 && ((Date.now() - lastShoutedInstant > 1000))){
                if ((Date.now() - lastPolledInstant) > 500){
                    document.getElementById('talkingPic')
                        .innerHTML = '<img src="idle.png" />';
                }
            }
            if (instantMeter.value > .03 && ((Date.now() - lastShoutedInstant > 1000))){
                document.getElementById('talkingPic')
                    .innerHTML = '<img src="talking.png" />';
                lastPolledInstant=Date.now();
            }
            if (instantMeter.value > .4){
                document.getElementById('talkingPic')
                    .innerHTML = '<img src="shouting.png" />';
                lastPolledInstant=Date.now();
                lastShoutedInstant=Date.now();
            }
            if(((Date.now() - lastShoutedInstant) < 1000) && ((Date.now() - lastShoutedInstant) > 500)){
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

navigator.mediaDevices.getUserMedia(constraints).
then(handleSuccess).catch(handleError);