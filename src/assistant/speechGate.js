// Energy-based speech onset. Echo cancellation is requested from the browser;
// this guard reduces playback/noise triggers, but cannot guarantee speaker separation.
export function speechThreshold(sensitivity=.65,playback=false,echoGuard=true){return (.006+(1-Math.max(0,Math.min(1,sensitivity)))*.024)*(playback&&echoGuard?1.6:1)}
export function shouldInterrupt({voicedSeconds,playbackAgeMs=1000,echoGuard=true,enabled=true}){return enabled&&voicedSeconds>=.14&&(!echoGuard||playbackAgeMs>=280)}
