// import { useForceUpdate } from "@/hooks";
import { RefCallback, useCallback, useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import MicrophonePlugin from "wavesurfer.js/src/plugin/microphone";
import { toast } from "react-toastify";

interface RecorderModalProps {
  onSave: (data: Blob) => void;
}

function RecorderModal({ onSave: handleSave }: RecorderModalProps) {
  // const forceUpdate = useForceUpdate();
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer>();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [record, setRecord] = useState<Blob[]>([]);

  const recorderRef: RefCallback<HTMLDivElement> = useCallback((node) => {
    if (node) {
      const w = WaveSurfer.create({
        container: node,
        interact: false,
        cursorWidth: 0,
        plugins: [MicrophonePlugin.create({})],
      });

      w.microphone.on("deviceReady", (stream: MediaStream) => {
        const m = new MediaRecorder(stream);
        m.ondataavailable = (e) => {
          if (e.data.size > 0) {
            console.log(e.data);
            setRecord((record) => [...record, e.data]);
          }
        };
        m.start();
        setMediaRecorder(m);
        toast.info(`녹음을 시작합니다`, { hideProgressBar: true });
      });

      w.microphone.on("deviceError", (code) => {
        toast.error(`녹음을 시작할 수 없습니다: ${code}`);
      });

      setWaveSurfer(w);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (waveSurfer) {
        waveSurfer.microphone.stopDevice();
        waveSurfer.microphone.destroy();
        waveSurfer.destroy();
      }
    };
  }, [waveSurfer]);

  return (
    <div
      className={`z-20 absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 grid place-content-center`}
    >
      <section
        className={`w-96 bg-white rounded-md shadow-xl p-4 border-4 ${
          mediaRecorder?.state === "recording" ? "border-red-500" : ""
        }`}
      >
        <div className="w-full" ref={recorderRef}></div>
        {waveSurfer && (
          <div className="flex justify-center gap-2">
            {mediaRecorder === undefined ? (
              <button
                className="btn bg-primary text-white hover:bg-opacity-70"
                onClick={(e) => {
                  e.preventDefault();
                  waveSurfer.microphone.start();
                }}
              >
                녹음 시작
              </button>
            ) : mediaRecorder.state === "recording" ? (
              <button
                className="btn bg-danger text-white hover:bg-opacity-70"
                onClick={(e) => {
                  e.preventDefault();
                  toast.warning("일시정지 기능은 구현 중에 있습니다.");
                  mediaRecorder.stop();
                  waveSurfer.microphone.pause();
                  waveSurfer.empty();
                }}
              >
                정지
              </button>
            ) : (
              <>
                <button
                  className="btn bg-blue-500 text-white hover:bg-opacity-70"
                  onClick={(e) => {
                    e.preventDefault();
                    // mediaRecorder.start();
                    // waveSurfer.microphone.play();
                    // forceUpdate();
                  }}
                  disabled
                >
                  녹음 재개
                </button>
                <button
                  className="btn bg-primary text-white hover:bg-opacity-70"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSave(new Blob(record));
                  }}
                >
                  저장
                </button>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default RecorderModal;
