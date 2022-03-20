import { useForceUpdate, useWaveSurfer } from "@/hooks";
import getBlobDuration from "get-blob-duration";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import MinimapPlugin from "wavesurfer.js/src/plugin/minimap";
import RecorderModal from "./RecorderModal";

function SimultaneousForm({
  audioFile,
  handleAudioFileChange,
}: {
  audioFile: Blob;
  handleAudioFileChange: (data: Blob) => void;
}) {
  const forceUpdate = useForceUpdate();
  const [recorderOpened, setRecorderOpened] = useState(false);
  const waveSurfer = useWaveSurfer({
    audioFile,
    onCreate: (w) => {
      w.on("ready", forceUpdate);
    },
    normalize: true,
    scrollParent: true,
    plugins: [MinimapPlugin.create({})],
  });
  const [duration, setDuration] = useState<number>();

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
        {audioFile.size > 0 ? (
          <>
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
                <button
                  className="btn mr-auto bg-primary text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    waveSurfer.surfer.current?.playPause();
                  }}
                >
                  재생 / 일시정지
                </button>
              </section>
            ) : (
              <div className="text-center">loading...</div>
            )}
          </>
        ) : (
          <div className="text-center">음성 파일이 없습니다.</div>
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
      {recorderOpened && (
        <RecorderModal
          onSave={handleSave}
          onClose={() => setRecorderOpened(false)}
        />
      )}
    </>
  );
}

export default SimultaneousForm;
