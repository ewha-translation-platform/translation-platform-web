import { useRef, useState } from "react";

function useRecorder(handleSave: (data: Blob, regions: Region[]) => void) {
  const recorder = useRef<MediaRecorder>();
  const records = useRef<Blob[]>([]);
  const durations = useRef<number[]>([]);
  const startedTime = useRef(0);
  const [isRecording, setIsRecording] = useState(false);

  function cleanup() {
    recorder.current?.stream.getTracks().forEach((s) => s.stop());
  }

  async function ready(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      recorder.current = new MediaRecorder(stream);

      recorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          records.current.push(e.data);
        }
      };

      recorder.current.onstop = async (e) => {
        handleSave(
          new Blob(records.current),
          durations.current.reduce<Region[]>(
            (acc, dur) =>
              acc.length === 0
                ? [{ start: 0, end: dur }]
                : [
                    ...acc,
                    {
                      start: acc[acc.length - 1].end + 1,
                      end: acc[acc.length - 1].end + dur,
                    },
                  ],
            []
          )
        );
        records.current = [];
        cleanup();
      };

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  function stop() {
    if (!recorder.current) throw new Error("Recorder is not running");

    durations.current.push(Date.now() - startedTime.current);
    recorder.current.stop();
    setIsRecording(false);
  }

  function pause() {
    if (!isRecording) throw new Error("Recorder is not running");

    recorder.current?.pause();
    setIsRecording(false);
    durations.current.push(Date.now() - startedTime.current);
  }

  function start() {
    if (!recorder.current) throw new Error("Recorder is not running");
    if (recorder.current.state === "recording")
      throw new Error("Recorder is already in recording state");

    switch (recorder.current.state) {
      case "inactive":
        recorder.current.start();
        break;
      case "paused":
        recorder.current.resume();
        break;
    }
    setIsRecording(true);
    startedTime.current = Date.now();
  }

  return {
    ready,
    start,
    stop,
    pause,
    isRecording,
    cleanup,
  };
}

export default useRecorder;
