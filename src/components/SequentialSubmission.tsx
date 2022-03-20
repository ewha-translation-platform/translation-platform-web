import { useForceUpdate, useRecorder, useWaveSurfer } from "@/hooks";
import { colorScheme } from "@/utils";
import { useEffect, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import MinimapPlugin from "wavesurfer.js/src/plugin/minimap";
import RegionsPlugin, {
  Region as SurferRegion,
} from "wavesurfer.js/src/plugin/regions";

interface SequentialSubmissionProps {
  audioFile: Blob;
  sequentialRegions: Region[];
  submissionRegions: Region[];
  submissionAudio: Blob;
  handleSubmssionAudioChange: (arg: Blob) => void;
  handleSubmissionRegionsChange: (regions: Region[]) => void;
}
function SequentialSubmission({
  audioFile,
  sequentialRegions,
  submissionRegions,
  submissionAudio,
  handleSubmssionAudioChange,
  handleSubmissionRegionsChange,
}: SequentialSubmissionProps) {
  const forceUpdate = useForceUpdate();
  const [currentRegionIdx, setCurrentRegionIdx] = useState(0);
  const [regions, setRegions] = useState<SurferRegion[]>();

  const stopWatch = useStopwatch({ autoStart: false });
  const recorder = useRecorder((data, regions) => {
    handleSubmssionAudioChange(data);
    handleSubmissionRegionsChange(regions);
  });

  const assignmentSurfer = useWaveSurfer({
    audioFile,
    onCreate: (w) => {
      w.on("load", forceUpdate);
      w.on("region-out", () => setTimeout(recorder.start, 200));
      setRegions(Object.values(w.regions.list));
    },
    plugins: [
      RegionsPlugin.create({
        regions: sequentialRegions.map(({ start, end }, idx) => ({
          id: idx.toString(),
          start: start / 1000,
          end: end / 1000 - 0.001, // due to region-out event fires incorrectly
          drag: false,
          resize: false,
        })),
      }),
      MinimapPlugin.create({}),
    ],
    interact: false,
    normalize: true,
    scrollParent: true,
  });
  const submissionSurfer = useWaveSurfer({
    audioFile: submissionAudio,
    onCreate: (w) => w.on("ready", forceUpdate),
    plugins: [RegionsPlugin.create({}), MinimapPlugin.create({})],
    interact: false,
    normalize: true,
    scrollParent: true,
  });

  useEffect(() => {
    submissionRegions.forEach(({ start, end }, idx) => {
      submissionSurfer.surfer.current?.regions.add({
        id: idx.toString(),
        start: start / 1000,
        end: end / 1000,
        resize: false,
        drag: false,
      });
    });
  }, [submissionSurfer.surfer, submissionRegions]);

  return (
    <>
      <label className="flex flex-col">
        원음
        <div ref={assignmentSurfer.refCallback}></div>
      </label>
      <label className="flex flex-col">
        내 음성
        <div ref={submissionSurfer.refCallback}></div>
      </label>
      {submissionAudio && (
        <>
          {Object.values(
            submissionSurfer.surfer.current?.regions.list || []
          ).map((r, idx) => (
            <button
              type="button"
              className="btn-sm text-white"
              key={r.id}
              style={{ backgroundColor: colorScheme(idx) }}
              onClick={() => r.play()}
            >
              구간{idx + 1}
            </button>
          ))}
          <button
            className="btn bg-primary text-white"
            onClick={() => submissionSurfer.surfer.current?.playPause()}
          >
            재생/일시정지
          </button>
        </>
      )}
      {regions && assignmentSurfer.surfer.current && (
        <div className="flex flex-col gap-2 bg-white p-4 shadow-md">
          <div>
            {stopWatch.minutes}분 {stopWatch.seconds}초
          </div>
          <section className="grid place-items-center">
            {currentRegionIdx === 0 ? (
              <button
                type="button"
                className="btn bg-red-500 text-white"
                onClick={async () => {
                  await recorder.ready();
                  regions[currentRegionIdx].play();
                  setCurrentRegionIdx(currentRegionIdx + 1);
                }}
              >
                통역 시작
              </button>
            ) : currentRegionIdx === regions.length ? (
              <button
                type="button"
                className="btn bg-primary text-white"
                onClick={() => {
                  recorder.stop();
                  setCurrentRegionIdx(0);
                }}
                disabled={!recorder.isRecording}
              >
                종료
              </button>
            ) : (
              <button
                type="button"
                className="btn bg-red-500 text-white"
                onClick={() => {
                  recorder.pause();
                  regions[currentRegionIdx].play();
                  setCurrentRegionIdx(currentRegionIdx + 1);
                }}
                disabled={!recorder.isRecording}
              >
                다음
              </button>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default SequentialSubmission;
