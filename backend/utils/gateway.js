import { ChildProcess, spawn } from 'child_process';
import { inputSettings , twitchSettings , youtubeSettings} from "./ffmpeg.js";

const gateway=(()=>{
     //     socket.on('Message', (streamData) => {
    //       console.log(streamData,(arg,callback)=>{
    //         console.log(arg);
    //         callback("connected");
    //       });
    //     });
    //     socket.on('disconnect', () => {
    //         console.log(`Socket disconnected: ${socket.id}`);
    //       });
    //   const twitch = `rtmp://live.twitch.tv/app/${process.env.TWITCH_STREAM_KEY}`;
    //   const youtubeDestinationUrl = `rtmp://a.rtmp.youtube.com/live2/${process.env.YOUTUBE_STREAM_KEY}`;
    //   const ffmpegInput = inputSettings.concat(
    //     youtubeSettings(youtubeDestinationUrl),
    //     //twitchSettings(twitch)
    //     // facebookSettings(facebook),
    //     // customRtmpSettings(customRTMP)
    //   );
    //   const ffmpeg = spawn('ffmpeg', ffmpegInput);
    
    //   // If FFmpeg stops for any reason, close the WebSocket connection.
    //   ffmpeg.on('close', (code, signal) => {
    //     console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
    //     // ws.terminate()
    //   });
    
    //   // Handle STDIN pipe errors by logging to the console.
    //   // These errors most commonly occur when FFmpeg closes and there is still
    //   // data to write.  If left unhandled, the server will crash.
    //   ffmpeg.stdin.on('error', (e) => {
    //     console.log('FFmpeg STDIN Error', e);
    //   });
    
    //   // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
    //   ffmpeg.stderr.on('data', (data) => {
    //     console.log('FFmpeg STDERR:', data.toString());
    //   });
    
    //   // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
    //   socket.on('message', (msg) => {
    // //    console.log('DATA', msg);
    //     ffmpeg.stdin.write(msg);
    //   });
    
    //   // If the client disconnects, stop FFmpeg.
    //   socket.conn.on('close', (e) => {
    //     console.log('kill: SIGINT');
    //     ffmpeg.kill('SIGINT');
    //   });
    //   });
});