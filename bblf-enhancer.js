// ==UserScript==
// @name         BBLF Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Monitor for issues on the live feed page, reloading or starting video when necessary. Can autoload quad cam, and remap fullscreen button to only show video.
// @author       liquid8d
// @match        https://www.paramountplus.com/shows/big_brother/live_feed/stream/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=paramountplus.com
// @grant        GM_log

// ==/UserScript==

(function() {
    'use strict';

    // force switch to quad cam on page load
    const autoQuadCam = true
    // hide chat and video thumbs on fullscreen
    const fullscreenVideoOnly = true
    // reload the page when an error is encountered
    const reloadOnError = true
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
    var fsButtonMapped = false

    if (localStorage.getItem('bblf_video_monitor_attempts')) attempts = (resetScript) ? 0 : parseInt(localStorage.getItem('bblf_video_monitor_attempts'))

    setInterval(checkVideo, monitorInterval)

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
                warn('start panel is showing, clicking to start video.')
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
                            const el = document.querySelector('.multi-cam-plugin-thumb-player-container .index-item[data-camid="5"]')
                            if (el) {
                                log('switching to quad cam')
                                el.click()
                                camNum = 5
                            } else {
                                warn('could not find quad cam element, unable to update')
                            }
                        } else {
                            log('video is ready and playing.')
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
    function log(msg) { console.log('BBLF Video Monitor: (' + attempts + ') ' + msg) }
    function warn(msg) { console.warn('BBLF Video Monitor: (' + attempts + ') ' + msg) }
    function error(msg) { console.error('BBLF Video Monitor: (' + attempts + ') ' + msg) }
    function info(msg) { console.info('BBLF Video Monitor: (' + attempts + ') ' + msg) }
})();