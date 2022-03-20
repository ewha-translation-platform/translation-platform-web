import chroma from "chroma-js";
import { RefCallback, useCallback, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import type { WaveSurferParams } from "wavesurfer.js/types/params";

interface Params extends Omit<WaveSurferParams, "container"> {
  audioFile: Blob;
  onCreate: (w: WaveSurfer) => void;
}

function useWaveSurfer({ audioFile, onCreate, ...rest }: Params) {
  const surfer = useRef<WaveSurfer>();

  const refCallback: RefCallback<HTMLDivElement> = useCallback(
    (container) => {
      if (!container) return;
      if (surfer.current) surfer.current.destroy();
      const w = WaveSurfer.create({
        container,
        waveColor: chroma("#00462A").alpha(0.5).hex(),
        progressColor: "#00462A",
        ...rest,
      });
      onCreate(w);
      w.load(URL.createObjectURL(audioFile));
      surfer.current = w;
    },
    //eslint-disable-next-line
    [surfer, audioFile]
  );

  useEffect(() => () => surfer.current?.destroy(), [surfer]);

  return { surfer, refCallback };
}

export default useWaveSurfer;
