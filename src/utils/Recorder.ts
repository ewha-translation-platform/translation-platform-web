import { toast } from "react-toastify";
import WaveSurfer from "wavesurfer.js";
import MicrophonePlugin from "wavesurfer.js/src/plugin/microphone";

export default class Recorder {
  waveSurfer?: WaveSurfer;
  constructor(
    private record: Blob[] = [],
    private mediaRecorder?: MediaRecorder
  ) {}

  async connect(
    visualizerDivNode: HTMLDivElement,
    onStop: (data: Blob) => void
  ) {
    try {
      this.waveSurfer = WaveSurfer.create({
        container: visualizerDivNode,
        interact: false,
        cursorWidth: 0,
        plugins: [MicrophonePlugin.create({})],
      });

      this.waveSurfer.microphone.on("deviceReady", (stream: MediaStream) => {
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            console.log(e.data);
            this.record.push(e.data);
          }
        };

        this.mediaRecorder.onstop = (e) => {
          onStop(new Blob(this.record));
        };
      });
      this.waveSurfer.microphone.start();
      this.waveSurfer.microphone.disconnect();
      this.waveSurfer.empty();

      this.waveSurfer.microphone.on("deviceError", (code) => {
        toast.error(`녹음을 시작할 수 없습니다: ${code}`);
      });
    } catch (error) {
      toast.error("입력 장치를 연결할 수 없습니다.");
    }
  }

  start() {
    this.waveSurfer?.microphone.connect();
    this.mediaRecorder?.start();
  }

  pause() {
    this.waveSurfer?.microphone.pause();
    this.waveSurfer?.empty();
    this.mediaRecorder?.pause();
  }

  resume() {
    this.waveSurfer?.microphone.play();
    this.mediaRecorder?.resume();
  }

  stop() {
    this.mediaRecorder?.stop();
    this.waveSurfer?.microphone.stopDevice();
  }

  get state() {
    return this.mediaRecorder?.state;
  }
}
