import { useForceUpdate, useRecorder, useWaveSurfer } from "@/hooks";
import { MouseEventHandler, useState } from "react";
import { useStopwatch } from "react-timer-hook";

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
  const [done, setDone] = useState(false);

  const stopWatch = useStopwatch({ autoStart: false });

  const recorder = useRecorder(handleSubmssionAudioChange);
  const assignmentSurfer = useWaveSurfer({
    audioFile,
    onCreate: (w) => w.on("load", forceUpdate),
    interact: false,
  });
  const submissionSurfer = useWaveSurfer({
    audioFile: submissionAudio,
    onCreate: (w) => w.on("load", forceUpdate),
    interact: false,
  });

  const handleStart: MouseEventHandler = async () => {
    if (!assignmentSurfer.surfer.current) return;
    await recorder.ready();
    recorder.start();
    assignmentSurfer.surfer.current.play();
    stopWatch.start();
  };

  const handleDone: MouseEventHandler = () => {
    recorder.stop();
    assignmentSurfer.surfer.current?.stop();
    stopWatch.pause();
    setDone(true);
  };

  return (
    <>
      <label className="flex flex-col">
        원음
        <div ref={assignmentSurfer.refCallback} />
      </label>
      <label className="flex flex-col">
        내 음성
        <div ref={submissionSurfer.refCallback}></div>
      </label>
      <section className="grid grid-cols-2 gap-1">
        <div className="col-span-full text-center">
          {stopWatch.minutes}분 {stopWatch.seconds}초
        </div>
        {!done &&
          (!recorder.isRecording ? (
            <button
              type="button"
              className="btn bg-red-500 text-white"
              onClick={handleStart}
            >
              통역 시작
            </button>
          ) : (
            <button
              type="button"
              className="btn bg-primary text-white"
              onClick={handleDone}
            >
              통역 종료
            </button>
          ))}
        {done && (
          <button
            className="btn bg-primary text-white"
            onClick={() => submissionSurfer.surfer.current?.playPause()}
          >
            재생/일시정지
          </button>
        )}
      </section>
      <label className="flex items-center gap-4">
        파일 업로드:
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files) handleSubmssionAudioChange(e.target.files[0]);
          }}
          accept="audio/*"
        />
      </label>
    </>
  );
}

export default SimultaneousSubmission;
