import { useForceUpdate } from "@/hooks";
import { Recorder } from "@/utils";
import chroma from "chroma-js";
import { RefCallback, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import WaveSurfer from "wavesurfer.js";

interface SimultaneousSubmissionProps {
  audioFile: Blob;
  submissionAudio: Blob;
  handleSubmssionAudioChange: (arg: Blob) => void;
}
function SimultaneousSubmission({
  audioFile,
  submissionAudio,
  handleSubmssionAudioChange,
}: SimultaneousSubmissionProps) {
  const forceUpdate = useForceUpdate();
  const waveSurfer = useRef<WaveSurfer>();
  const submissionSurfer = useRef<WaveSurfer>();
  const recorder = useRef(new Recorder());
  const [isRecording, setIsRecording] = useState(false);

  const submissionContainerRef: RefCallback<HTMLDivElement> = useCallback(
    (node) => {
      if (!node) return;
      const w = WaveSurfer.create({
        container: node,
        waveColor: chroma("#00462A").alpha(0.5).hex(),
        progressColor: "#00462A",
      });
      w.on("ready", forceUpdate);
      w.load(URL.createObjectURL(submissionAudio));
      submissionSurfer.current = w;
    },
    [forceUpdate, submissionAudio]
  );

  const audioContainerRef: RefCallback<HTMLDivElement> = useCallback(
    (node) => {
      if (!node) return;
      const w = WaveSurfer.create({
        container: node,
        waveColor: chroma("#00462A").alpha(0.5).hex(),
        progressColor: "#00462A",
        interact: false,
      });
      w.load(URL.createObjectURL(audioFile));
      w.on("ready", forceUpdate);
      waveSurfer.current = w;
    },
    [forceUpdate, audioFile]
  );

  const recordVisualizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      waveSurfer.current?.destroy();
    };
  }, []);

  return (
    <>
      <label className="flex flex-col">
        원음
        <div ref={audioContainerRef}></div>
      </label>
      <label className="flex flex-col">
        내 음성
        <div ref={submissionContainerRef}></div>
      </label>
      {submissionSurfer.current?.isReady && (
        <button onClick={() => submissionSurfer.current?.playPause()}>
          재생/일시정지
        </button>
      )}
      <div ref={recordVisualizerRef}></div>
      <section className="grid grid-cols-2 gap-1">
        {isRecording ? (
          <button
            className="btn bg-primary text-white"
            onClick={(e) => {
              e.preventDefault();
              waveSurfer.current?.stop();
              setIsRecording(false);
              recorder.current?.stop();
            }}
          >
            종료
          </button>
        ) : (
          <button
            className="btn bg-red-500 text-white"
            onClick={async (e) => {
              e.preventDefault();
              if (!waveSurfer.current || !recordVisualizerRef.current) return;
              try {
                await recorder.current.connect(
                  recordVisualizerRef.current,
                  handleSubmssionAudioChange
                );
                setIsRecording(true);
                recorder.current.start();
                waveSurfer.current.play();
              } catch (error) {
                toast.error("입력 장치를 연결할 수 없습니다.");
              }
            }}
          >
            통역 시작
          </button>
        )}
      </section>
    </>
  );
}

export default SimultaneousSubmission;
