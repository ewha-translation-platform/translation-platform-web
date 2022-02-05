import cheerio from "cheerio";
import chroma from "chroma-js";
import JSZip from "jszip";
import {
  ChangeEvent,
  RefCallback,
  useCallback,
  useEffect,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { Checkbox, InputField, Select, TextArea } from "@/components/common";
import { RecorderModal } from "@/components";
import { assignmentService } from "@/services";
import { toast } from "react-toastify";
import { useForceUpdate } from "@/hooks";

const assignmentTypeOptions = [
  { label: "번역", value: "translate" },
  { label: "순차 통역", value: "sequential" },
  { label: "동시 통역", value: "simultaneous" },
];

function AssignmentForm() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, reset } =
    useForm<CreateAssignmentDto>({
      defaultValues: {
        assignmentType: "TRANSLATION",
        isPublic: false,
        dueDateTime: new Date().toISOString().slice(0, -8),
      },
    });
  const watchAssignmentType = watch("assignmentType", "TRANSLATION");
  const watchAudioFile = watch("audioFile", null);

  useEffect(() => {
    if (assignmentId !== "new") {
      (async function () {
        const assignment = await assignmentService.getOne(+assignmentId!);
        reset(assignment);
      })();
    }
  }, [assignmentId, reset]);

  const onSubmit: SubmitHandler<CreateAssignmentDto> = ({
    audioFile,
    ...data
  }) => {
    assignmentService
      .postOne({
        ...data,
        audioFile: null,
        weekNumber: +data.weekNumber,
        sequentialRegions: [],
      })
      .then(() => toast.success("저장되었습니다."))
      .catch((e) => toast.error(`오류가 발생했습니다 ${e}`));
  };

  const handleFileInput = useCallback(
    ({ target: { files } }: ChangeEvent<HTMLInputElement>) => {
      if (files === null) return;
      const file = files[0];
      if (file.name.match(/.docx$/)) {
        JSZip.loadAsync(file)
          .then((zip) => zip.file("word/document.xml")!.async("string"))
          .then((xml) =>
            cheerio.load(xml, {
              normalizeWhitespace: true,
              xmlMode: true,
            })
          )
          .then(($) => {
            const out: string[] = [];
            $("w\\:t").each((_, el) => {
              out.push($(el).text());
            });
            setValue("textFile", out.join());
          });
      } else {
        const reader = new FileReader();
        reader.addEventListener("load", ({ target }) => {
          const content = target?.result as string;
          setValue("textFile", content.trim());
        });
        reader.readAsText(file);
      }
    },
    [setValue]
  );

  return (
    <main className="grid grid-rows-[auto_minmax(0,100%)] overflow-auto p-4">
      <h2>{assignmentId === "new" ? "과제 추가" : "과제 수정"}</h2>
      <form
        className="grid max-w-5xl grid-rows-[1fr_auto] gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <section className="grid auto-rows-min grid-cols-4 gap-2">
          <Select
            label="주차"
            className="col-span-2"
            {...register("weekNumber", { required: true })}
            options={[...Array(16)].map((_, idx) => ({
              value: (idx + 1).toString(),
              label: `${idx + 1}주차`,
            }))}
          />
          <InputField
            label="기한"
            className="col-span-2"
            type="datetime-local"
            {...register("dueDateTime", { required: true })}
          />
          <InputField
            label="과제명"
            className="col-span-3"
            {...register("name", { required: true })}
          />
          <Select
            label="과제 종류"
            {...register("assignmentType", { required: true })}
            options={assignmentTypeOptions}
          />
          <TextArea
            label="과제 설명"
            className="col-span-4"
            rows={5}
            innerClassName="resize-none"
            {...register("description", { required: true })}
          ></TextArea>
          <Checkbox
            label="과제 제출물 공개 여부"
            className="col-span-4"
            {...register("isPublic")}
          />
        </section>
        {watchAssignmentType === "TRANSLATION" ? (
          <Translation />
        ) : watchAssignmentType === "SEQUENTIAL" ? (
          // <Sequential />
          <span>준비중입니다.</span>
        ) : (
          <Simultaneous
            audioFile={
              watchAudioFile !== undefined
                ? new Blob([watchAudioFile || ""], {
                    type: "audio/ogg; codecs=opus",
                  })
                : new Blob([])
            }
            handleAudioFileChange={(data) => setValue("audioFile", data)}
          />
        )}
        <section className="col-span-full flex gap-2">
          <button
            className="btn bg-secondary-500 text-white"
            onClick={() => {
              navigate("..");
            }}
          >
            뒤로가기
          </button>
          <button className="btn ml-auto bg-primary text-white" disabled>
            미리보기
          </button>
          <input
            type="submit"
            value="확인"
            className="btn justify-self-end bg-primary text-white"
          />
        </section>
      </form>
    </main>
  );

  function Translation() {
    return (
      <section className="flex flex-col gap-2">
        <TextArea
          label="원문"
          className="flex-grow"
          innerClassName="resize-none h-full"
          {...register("textFile", { required: true })}
        ></TextArea>
        <input type="file" accept=".txt,.docx" onChange={handleFileInput} />
      </section>
    );
  }

  function Simultaneous({
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
            // plugins: [
            //   RegionsPlugin.create({
            //     dragSelection: true,
            //     slop: 5,
            //     regions: watchSequentialRegions?.map(({ start, end }, idx) => ({
            //       id: idx.toString(),
            //       start,
            //       end,
            //     })),
            //   }),
            // ],
          });
          waveSurfer.load(URL.createObjectURL(audioFile));
          waveSurfer.on("ready", forceUpdate);
          setWaveSurfer(waveSurfer);
        }
      },
      [forceUpdate, audioFile]
    );

    const handleSave = (data: Blob) => {
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
                className="btn mr-auto bg-primary text-white"
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
          <Select
            label="다시 듣기 제한"
            {...register("maxPlayCount", { required: true })}
            options={[{ label: "무제한", value: "0" }]}
          />
        </section>
        {recorderOpened && <RecorderModal onSave={handleSave} />}
      </>
    );
  }

  // function Sequential() {
  //   return (
  //     <section className="flex flex-col gap-2">
  //       <span>원음</span>
  //       <div ref={wavesurferContainer}></div>
  //       {waveSurfer && (
  //         <>
  //           <section className="flex gap-1">
  //             {Object.values(waveSurfer.regions.list).map((r, idx) => (
  //               <button
  //                 className="btn-sm text-white"
  //                 key={r.id}
  //                 style={{ backgroundColor: colorScheme(idx) }}
  //                 onClick={(e) => {
  //                   e.preventDefault();
  //                   r.play();
  //                 }}
  //               >
  //                 구간{idx + 1}
  //               </button>
  //             ))}
  //             <button
  //               className="btn-sm bg-danger text-white"
  //               onClick={() => {
  //                 if (!window.confirm("구간을 전부 삭제합니다.")) return;
  //                 waveSurfer.regions.clear();
  //               }}
  //             >
  //               전체 삭제
  //             </button>
  //           </section>
  //           <section className="flex gap-2">
  //             <button
  //               className="btn bg-primary text-white mr-auto"
  //               onClick={(e) => {
  //                 e.preventDefault();
  //                 waveSurfer.playPause();
  //               }}
  //             >
  //               재생 / 일시정지
  //             </button>
  //           </section>
  //         </>
  //       )}
  //       <section className="flex gap-2">
  //         <input
  //           className="flex-grow"
  //           type="file"
  //           accept="audio/*"
  //           placeholder="원음"
  //         />
  //         <button
  //           className="btn bg-danger text-white"
  //           onClick={(e) => {
  //             e.preventDefault();
  //             alert("녹음을 시작합니다");
  //           }}
  //         >
  //           녹음하기
  //         </button>
  //       </section>
  //       <Select
  //         label="다시 듣기 제한"
  //         {...register("maxPlayCount", { required: true })}
  //         options={[{ label: "무제한", value: "0" }]}
  //       />
  //     </section>
  //   );
  // }
}

export default AssignmentForm;
