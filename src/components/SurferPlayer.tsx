import { useForceUpdate, useWaveSurfer } from "@/hooks";
import { colorScheme } from "@/utils";
import { MutableRefObject } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";

interface SurferPlayerProps {
  audioFile: Blob;
  surferRef?: MutableRefObject<WaveSurfer | undefined>;
  regions?: Region[];
}

function SurferPlayer({ audioFile, surferRef, regions }: SurferPlayerProps) {
  const forceUpdate = useForceUpdate();
  const waveSurfer = useWaveSurfer({
    audioFile,
    onCreate: (w) => {
      w.on("ready", forceUpdate);
      if (surferRef) surferRef.current = w;
    },
    plugins: [
      RegionsPlugin.create({
        regions:
          regions?.map(({ start, end }, idx) => ({
            id: idx.toString(),
            start: start / 1000,
            end: end / 1000,
            drag: false,
            resize: false,
          })) || [],
      }),
    ],
    height: 30,
  });

  return (
    <>
      <div className="flex h-[30px] gap-2">
        <div
          ref={waveSurfer.refCallback}
          className="max-h-full flex-grow"
        ></div>
      </div>
      <div className="flex gap-1 p-1">
        {regions &&
          Object.values(waveSurfer.surfer.current?.regions.list || []).map(
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
      </div>
    </>
  );
}

export default SurferPlayer;
