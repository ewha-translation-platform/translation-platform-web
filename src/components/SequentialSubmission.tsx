import { useForceUpdate } from "@/hooks";
import { Recorder } from "@/utils";
import chroma from "chroma-js";
import { RefCallback, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";

interface SequentialSubmissionProps {
  audioFile: Blob;
  sequentialRegions: Region[];
  submissionAudio: Blob;
  handleSubmssionAudioChange: (arg: Blob) => void;
}
function SequentialSubmission({
  audioFile,
  sequentialRegions,
  submissionAudio,
  handleSubmssionAudioChange,
}: SequentialSubmissionProps) {
  const forceUpdate = useForceUpdate();
  const [isLastRegion, setIsLastRegion] = useState(false);
  const [recordVisible, setRecordVisible] = useState(true);
  const [cur, setCur] = useState(-1);
  const waveSurfer = useRef<WaveSurfer>();
  const submissionSurfer = useRef<WaveSurfer>();
  const recorder = useRef(new Recorder());

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
        plugins: [
          RegionsPlugin.create({
            regions: sequentialRegions.map(({ start, end }, idx) => ({
              id: idx.toString(),
              start,
              end,
              drag: false,
              resize: false,
            })),
          }),
        ],
        progressColor: "#00462A",
      });
      w.load(URL.createObjectURL(audioFile));
      w.on("ready", forceUpdate);
      w.on("region-out", () => {
        toast.info("region out");
        toast.info(recorder.current.state);
        switch (recorder.current.state) {
          case "inactive":
            recorder.current?.start();
            break;
          case "paused":
            recorder.current?.resume();
            break;
          default:
        }
      });
      waveSurfer.current = w;
    },
    [forceUpdate, sequentialRegions, audioFile]
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
      {recordVisible && (
        <section className="fixed top-0 left-0 grid h-screen w-screen place-content-center bg-black bg-opacity-40">
          <div className="flex flex-col gap-2 bg-white p-4 shadow-md">
            <h1>순차통역 과제</h1>
            <div ref={recordVisualizerRef}></div>
            <section className="grid grid-cols-2 gap-1">
              <button
                className="btn bg-primary text-white"
                onClick={(e) => {
                  e.preventDefault();
                  recorder.current?.stop();
                  setCur(-1);
                }}
              >
                종료
              </button>
              {!isLastRegion &&
                (cur === -1 ? (
                  <button
                    className="btn bg-red-500 text-white"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!waveSurfer.current || !recordVisualizerRef.current)
                        return;

                      try {
                        await recorder.current.connect(
                          recordVisualizerRef.current,
                          (data) => {
                            handleSubmssionAudioChange(data);
                            setRecordVisible(false);
                          }
                        );
                      } catch (error) {
                        toast.error("입력 장치를 연결할 수 없습니다.");
                      }

                      const nextCur = cur + 1;
                      if (nextCur === sequentialRegions.length - 1)
                        setIsLastRegion(true);

                      Object.values(waveSurfer.current.regions.list)[
                        nextCur
                      ].play();

                      setCur(nextCur);
                    }}
                  >
                    시작하기
                  </button>
                ) : (
                  <button
                    className="btn bg-red-500 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!waveSurfer.current) return;
                      const nextCur = cur + 1;
                      if (nextCur === sequentialRegions.length - 1)
                        setIsLastRegion(true);

                      recorder.current?.pause();
                      Object.values(waveSurfer.current.regions.list)[
                        nextCur
                      ].play();

                      setCur(nextCur);
                    }}
                  >
                    다음
                  </button>
                ))}
            </section>
          </div>
        </section>
      )}
    </>
  );
}

export default SequentialSubmission;
