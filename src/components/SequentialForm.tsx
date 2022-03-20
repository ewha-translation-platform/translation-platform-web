import { useForceUpdate, useWaveSurfer } from "@/hooks";
import { colorScheme } from "@/utils";
import getBlobDuration from "get-blob-duration";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import MinimapPlugin from "wavesurfer.js/src/plugin/minimap";
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";
import RecorderModal from "./RecorderModal";

interface SequentialFormProps {
  audioFile: Blob;
  handleAudioFileChange: Dispatch<SetStateAction<Blob | null>>;
  sequentialRegions: Region[];
  handleSequentialRegionsChange: Dispatch<SetStateAction<Region[]>>;
}

function SequentialForm({
  audioFile,
  handleAudioFileChange,
  sequentialRegions,
  handleSequentialRegionsChange,
}: SequentialFormProps) {
  const forceUpdate = useForceUpdate();
  const [recorderOpened, setRecorderOpened] = useState(false);
  const [duration, setDuration] = useState<number>();
  const waveSurfer = useWaveSurfer({
    audioFile,
    onCreate: (w) => {
      w.on("load", forceUpdate);
      w.on("ready", forceUpdate);
      w.on("region-update-end", (obj) => {
        handleSequentialRegionsChange((x) => [
          ...x,
          { start: obj.start * 1000, end: obj.end * 1000 },
        ]);
        forceUpdate();
      });
    },
    interact: true,
    normalize: true,
    scrollParent: true,
    plugins: [
      RegionsPlugin.create({
        dragSelection: true,
        slop: 5,
        regions: sequentialRegions.map(({ start, end }, idx) => ({
          id: idx.toString(),
          start: start / 1000,
          end: end / 1000,
        })),
      }),
      MinimapPlugin.create({}),
    ],
  });

  useEffect(() => {
    if (audioFile.size > 0) getBlobDuration(audioFile).then(setDuration);
  }, [audioFile]);

  const handleSave = async (data: Blob) => {
    setRecorderOpened(false);
    handleAudioFileChange(data);
    toast.success("저장되었습니다.");
  };

  return (
    <>
      <section className="flex flex-col gap-2">
        <span>
          원음:
          {duration && (
            <span>
              {Math.floor(duration / 60)}분 {Math.round(duration % 60)}초
            </span>
          )}
        </span>
        <div ref={waveSurfer.refCallback}></div>
        {waveSurfer.surfer.current?.isReady ? (
          <section className="flex gap-2">
            <section className="flex gap-1">
              {Object.values(waveSurfer.surfer.current.regions.list).map(
                (r, idx) => (
                  <button
                    type="button"
                    className="btn-sm text-white"
                    key={r.id}
                    style={{ backgroundColor: colorScheme(idx) }}
                    onClick={() => r.play()}
                  >
                    구간{idx + 1}
                  </button>
                )
              )}
              <button
                type="button"
                className="btn-sm bg-danger text-white"
                onClick={() => {
                  if (!window.confirm("구간을 전부 삭제합니다.")) return;
                  waveSurfer.surfer.current?.regions.clear();
                  handleSequentialRegionsChange([]);
                }}
              >
                전체 삭제
              </button>
            </section>
            <button
              type="button"
              className="btn mr-auto bg-primary text-white"
              onClick={() => waveSurfer.surfer.current?.playPause()}
            >
              재생 / 일시정지
            </button>
          </section>
        ) : (
          <div>Loading...</div>
        )}
        <section className="flex gap-2">
          <input
            className="flex-grow"
            type="file"
            accept="audio/*"
            placeholder="원음"
            onChange={(e) => {
              if (!e.target.files) return;
              const file = e.target.files[0];
              handleAudioFileChange(file);
            }}
          />
          <button
            type="button"
            className="btn bg-danger text-white"
            onClick={() => setRecorderOpened(true)}
          >
            녹음하기
          </button>
        </section>
      </section>
      {recorderOpened && (
        <RecorderModal
          onSave={handleSave}
          onClose={() => setRecorderOpened(false)}
        />
      )}
    </>
  );
}

export default SequentialForm;
