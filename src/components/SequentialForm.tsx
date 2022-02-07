import { useForceUpdate } from "@/hooks";
import { colorScheme } from "@/utils";
import chroma from "chroma-js";
import { RefCallback, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";
import { RecorderModal } from ".";

function SequentialForm({
  audioFile,
  handleAudioFileChange,
  sequentialRegions,
  handleSequentialRegionsChange,
}: {
  audioFile: Blob;
  handleAudioFileChange: (data: Blob) => void;
  sequentialRegions: Region[];
  handleSequentialRegionsChange: (data: Region[]) => void;
}) {
  const forceUpdate = useForceUpdate();
  const [recorderOpened, setRecorderOpened] = useState(false);
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer>();

  const audioContainerRef: RefCallback<HTMLDivElement> = useCallback(
    (node) => {
      if (node) {
        const waveSurfer = WaveSurfer.create({
          container: node,
          waveColor: chroma("#00462A").alpha(0.5).hex(),
          progressColor: "#00462A",
          plugins: [
            RegionsPlugin.create({
              dragSelection: true,
              slop: 5,
              regions: sequentialRegions.map(({ start, end }, idx) => ({
                id: idx.toString(),
                start,
                end,
              })),
            }),
          ],
        });
        waveSurfer.load(URL.createObjectURL(audioFile));
        waveSurfer.on("ready", forceUpdate);
        waveSurfer.on("region-update-end", (obj) => {
          handleSequentialRegionsChange([
            ...sequentialRegions,
            { start: obj.start, end: obj.end },
          ]);
          forceUpdate();
        });
        setWaveSurfer(waveSurfer);
      }
    },
    [forceUpdate, audioFile, sequentialRegions, handleSequentialRegionsChange]
  );

  useEffect(() => {
    return () => {
      waveSurfer?.destroy();
    };
  }, [waveSurfer]);

  const handleSave = async (data: Blob) => {
    setRecorderOpened(false);
    handleAudioFileChange(data);
    toast.success("저장되었습니다.");
  };

  return (
    <>
      <section className="flex flex-col gap-2">
        <span>원음</span>
        <div ref={audioContainerRef}></div>
        {waveSurfer?.isReady && (
          <section className="flex gap-2">
            <section className="flex gap-1">
              {Object.values(waveSurfer.regions.list).map((r, idx) => (
                <button
                  className="btn-sm text-white"
                  key={r.id}
                  style={{ backgroundColor: colorScheme(idx) }}
                  onClick={(e) => {
                    e.preventDefault();
                    r.play();
                  }}
                >
                  구간{idx + 1}
                </button>
              ))}
              <button
                className="btn-sm bg-danger text-white"
                onClick={() => {
                  if (!window.confirm("구간을 전부 삭제합니다.")) return;
                  waveSurfer.regions.clear();
                  handleSequentialRegionsChange([]);
                }}
              >
                전체 삭제
              </button>
            </section>
            <button
              className="btn bg-primary mr-auto text-white"
              onClick={(e) => {
                e.preventDefault();
                waveSurfer.playPause();
              }}
            >
              재생 / 일시정지
            </button>
          </section>
        )}
        <section className="flex gap-2">
          <input
            className="flex-grow"
            type="file"
            accept="audio/*"
            placeholder="원음"
            disabled
          />
          <button
            className="btn bg-danger text-white"
            onClick={(e) => {
              e.preventDefault();
              setRecorderOpened(true);
            }}
          >
            녹음하기
          </button>
        </section>
      </section>
      {recorderOpened && <RecorderModal onSave={handleSave} />}
    </>
  );
}

export default SequentialForm;
