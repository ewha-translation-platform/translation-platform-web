import { useForceUpdate } from "@/hooks";
import chroma from "chroma-js";
import { RefCallback, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import WaveSurfer from "wavesurfer.js";
import { RecorderModal } from ".";

function SimultaneousForm({
  audioFile,
  handleAudioFileChange,
}: {
  audioFile: Blob;
  handleAudioFileChange: (data: Blob) => void;
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
        });
        waveSurfer.load(URL.createObjectURL(audioFile));
        waveSurfer.on("ready", forceUpdate);
        setWaveSurfer(waveSurfer);
      }
    },
    [forceUpdate, audioFile]
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

export default SimultaneousForm;
