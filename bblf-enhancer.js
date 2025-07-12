// ==UserScript==
// @name         BBLF Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Monitor for issues on the live feed page, reloading or starting video when necessary. Can autoload quad cam, add hotkeys, show video scrubber, and remap fullscreen button to only show video.
// @author       liquid8d
// @match        https://www.paramountplus.com/shows/big_brother/live_feed/stream/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=paramountplus.com
// @grant        GM_log

// ==/UserScript==
/*
v 1.3 (2025)
 - now need to click start button to use (this forces user interaction with the page to ensure js executes)
 - add removeControls (hides P+ video controls and enables scrubber on video)
v 1.2
 - add extendedWatch
*/

(function() {
    'use strict';

    const hotkeys = [
        { key: 1, action: function() { switchCam(1) } },
        { key: 2, action: function() { switchCam(2) } },
        { key: 3, action: function() { switchCam(3) } },
        { key: 4, action: function() { switchCam(4) } },
        { key: 5, action: function() { switchCam(5) } }
    ]

    // force switch to quad cam on page load
    const autoQuadCam = true
    // remove P+ video controls and show built-in video controls allowing scrubbing
    const removeControls = true
    // hide chat and video thumbs on fullscreen
    const fullscreenVideoOnly = true
    // reload the page when an error is encountered
    const reloadOnError = true
    // keep watching if still watching is shown
    const extendedWatch = true
    // enable hotkeys
    const enableHotkeys = true
    // autostart video when page is loaded
    const forcePlay = true
    // delay before reloading the page on an error (secs * ms)
    const reloadDelay = 1 * 1000
    // frequency to check player status (secs * ms)
    const monitorInterval = 3 * 1000
    // max attempts to retry on failures before giving up
    const retryMaxAttempts = 10
    // reset the 'retry' attempts in the script, if it is no longer working
    const resetScript = false

    // DO NOT MODIFY AFTER HERE

    // current camera (only modified to verify quad cam switch)
    var camNum = 1
    // current attempts, will fail after retryMaxAttemps reached
    var attempts = 0
    // whether the fullscreen button has been remapped
    var fsButtonMapped = false
    // whether the P+ player controls have been removed
    var controlsRemoved = false

    if (localStorage.getItem('bblf_video_monitor_attempts')) attempts = (resetScript) ? 0 : parseInt(localStorage.getItem('bblf_video_monitor_attempts'))

    log('waiting for user to click start button')

    injectStartButton()

    function injectStartButton() {
        log('injected start button')
        var startEl = document.createElement('input')
        startEl.id = 'bblf-enhance'
        startEl.type = 'button'
        startEl.value = 'Start BBLF Enhancer'
        startEl.style = 'position: relative; left: calc(50% - 80px); width: 160px; height: 48px; z-index: 99999; cursor: pointer;'
        startEl.addEventListener('click', function() {
            log('starting bblf enhancer')
            // remove start button
            startEl.parentNode.removeChild(startEl)
            // enable hotkeys
            if (enableHotkeys) {
                document.onkeydown = function(e) {
                    for (var i = 0; i < hotkeys.length; i++) {
                        const hotkey = hotkeys[i].key.toString()
                        if (e.key === hotkey || e.code === hotkey) hotkeys[i].action()
                    }
                }
            }
            // start watching video
            setInterval(checkVideo, monitorInterval)
        })
        var mcplayerEl = document.getElementById('mcplayer')
        mcplayerEl.parentNode.insertBefore(startEl, mcplayerEl.nextSibling)
        mcplayerEl.appendChild(startEl)
    }

    function checkVideo() {
        if (fullscreenVideoOnly && !fsButtonMapped) {
            log('remapping fullscreen button')
            // remaps the fullscreen button to only fullscreen video skin
            const el = document.querySelector('button.btn-fullscreen')
            if (el) {
                el.onclick = function() {
                    if (document.fullscreenElement) {
                        document.exitFullscreen()
                    } else {
                        const player = document.querySelector('.aa-player-skin')
                        player.requestFullscreen()
                    }
                }
                fsButtonMapped = true
            } else {
                warn('can not remap fullscreen button, missing element')
            }
        }

        if (extendedWatch) {
            const countdownButton = document.querySelector('.stream-countdown-button')
            if (countdownButton) {
                log('found stream-countdown-button, clicking')
                countdownButton.click()
            }
            // watch for still watching element and restart
            const stillWatchingEl = document.querySelector('.timeout-panel-button-container')
            if (stillWatchingEl) {
                log('found timeout button, clicking')
                stillWatchingEl.click()
            }
        }

        if (attempts >= retryMaxAttempts) {
            warn('gave up, max attempts reached. Increase "maxAttempts" or set "resetScript" to true, then manually reload the page.')
            return
        }

        // check for smart tag error
        var errorEl = document.querySelector('.smart-tag-error-panel-content')
        if (errorEl) {
            warn('smart tag error found')
            if (reloadOnError) {
                // reload the page
                attempts += 1
                localStorage.setItem('bblf_video_monitor_attempts', attempts)
                setTimeout(function() { window.location.reload() }, reloadDelay)
            }
        } else {
            var startPanelEl = document.querySelector('.start-panel.show')
            if (startPanelEl) {
                warn('start panel is showing, click to start video.')
                var clickEl = document.querySelector('.start-panel-click-overlay')
                clickEl.click()
            } else {
                var videoEl = document.querySelector('.aa-player-skin .player-wrapper video')
                if (videoEl) {
                    if (videoEl.paused) {
                        if (forcePlay) {
                            // TODO not working (maybe user has to click)
                            // attempt to unpause video
                            info('video is available and paused, trying to force play (manual user intervention may be required)')
                            const el = document.getElementById('mcplayer')
                            el.click()
                            attempts += 1
                            localStorage.setItem('bblf_video_monitor_attempts', attempts)
                        } else {
                            // video is ok, but user doesn't want to forcePlay it
                            info('video is available and paused, "forcePlay" is not enabled')
                        }
                    } else {
                        if (autoQuadCam && camNum == 1) {
                            log('switching to quad cam')
                            switchCam(5)
                            camNum = 5
                        } else {
                            log('video is ready and playing.')
                            if (removeControls && !controlsRemoved) {
                                log('removing P+ controls')
                                controlsRemoved = true
                                // remove the player elements
                                const playerEls = ['.controls-backplane', '.controls-manager', '.top-menu-backplane']
                                for (var i = 0; i < playerEls.length; i++) {
                                    var el = document.querySelector(playerEls[i])
                                    el.parentNode.removeChild(el)
                                }
                                // enable built-in video controls allowing scrubbing
                            }
                            if (controlsRemoved) videoEl.controls = true
                        }
                    }
                    attempts = 0
                    localStorage.setItem('bblf_video_monitor_attempts', 0)
                } else {
                    // missing video element, something else is wrong here
                    warn('unable to find an error or the video element, you might need to manually reload the page')
                }
            }
        }
    }

    function switchCam(num) {
        const el = document.querySelector('.multi-cam-plugin-thumb-player-container .index-item[data-camid="' + num + '"]')
        if (el) {
            el.click()
        } else {
            warn('could not find camera element ' + num + ', unable to change')
        }
    }

    function log(msg) { console.log('BBLF Enhancer: (' + attempts + ') ' + msg) }
    function warn(msg) { console.warn('BBLF Enhancer: (' + attempts + ') ' + msg) }
    function error(msg) { console.error('BBLF Enhancer: (' + attempts + ') ' + msg) }
    function info(msg) { console.info('BBLF Enhancer: (' + attempts + ') ' + msg) }
})();