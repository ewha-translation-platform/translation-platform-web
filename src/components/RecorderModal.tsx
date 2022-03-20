import { useRecorder } from "@/hooks";
import { XIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { useStopwatch } from "react-timer-hook";

interface RecorderModalProps {
  onSave: (data: Blob) => void;
  onClose: () => void;
}

function RecorderModal({
  onSave: handleSave,
  onClose: handleClose,
}: RecorderModalProps) {
  const [isRecordStarted, setIsRecordStarted] = useState(false);
  const recorder = useRecorder(handleSave);
  const stopWatch = useStopwatch({ autoStart: false });

  return (
    <div className="absolute top-0 left-0 z-20 grid h-full w-full place-content-center bg-black bg-opacity-50">
      <section
        className={`relative w-96 space-y-2 rounded-md border-4 bg-white p-4 shadow-xl ${
          recorder.isRecording ? "border-red-500" : ""
        }`}
      >
        <XIcon
          type="button"
          className="absolute top-0 right-0 h-8 w-8 cursor-pointer rounded-md bg-danger p-1 text-white hover:opacity-70"
          onClick={() => {
            if (!window.confirm("녹음을 취소하시겠습니까?")) return;
            recorder.isRecording && recorder.stop();
            handleClose();
          }}
        ></XIcon>
        <div className="text-center text-xl">{stopWatch.seconds}초</div>
        <div className="flex justify-center gap-2">
          {!isRecordStarted ? (
            <button
              type="button"
              className="btn bg-primary text-white hover:bg-opacity-70"
              onClick={async (e) => {
                if (await recorder.ready()) {
                  recorder.start();
                  setIsRecordStarted(true);
                }
                stopWatch.start();
              }}
            >
              녹음 시작
            </button>
          ) : recorder.isRecording ? (
            <button
              type="button"
              className="btn bg-yellow-500 text-white hover:bg-opacity-70"
              onClick={(e) => {
                recorder.pause();
                stopWatch.pause();
              }}
            >
              멈추기
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn bg-blue-500 text-white hover:bg-opacity-70"
                onClick={(e) => {
                  recorder.start();
                  stopWatch.start();
                }}
              >
                계속 녹음
              </button>
              <button
                type="button"
                className="btn bg-danger text-white hover:bg-opacity-70"
                onClick={(e) => {
                  recorder.stop();
                  stopWatch.pause();
                }}
              >
                완료
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default RecorderModal;
