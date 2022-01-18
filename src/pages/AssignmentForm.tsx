import cheerio from "cheerio";
import chroma from "chroma-js";
import JSZip from "jszip";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";
import Checkbox from "../components/common/Checkbox";
import InputField from "../components/common/InputField";
import Select from "../components/common/Select";
import TextArea from "../components/common/TextArea";
import assignmentService from "../services/assignmentService";
import colorScheme from "../utils/colorScheme";

const assignmentTypeOptions = [
  { label: "번역", value: "translate" },
  { label: "순차 통역", value: "sequential" },
  { label: "동시 통역", value: "simultaneous" },
];

function AssignmentForm() {
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);
  const { register, handleSubmit, watch, setValue, reset } =
    useForm<AssignmentDto>({
      defaultValues: {
        assignmentType: "translate",
        isPublic: false,
        dueDateTime: new Date().toISOString().slice(0, -8),
        feedbackCategoryIds: [],
        sequentialRegions: [],
      },
    });
  const watchAssignmentType = watch("assignmentType");
  const watchSequentialRegions = watch("sequentialRegions");

  useEffect(() => {
    if (assignmentId !== "new") {
      assignmentService
        .getOne(+assignmentId!)
        .then((assignment) => reset({ ...assignment }));
    }
  }, [assignmentId, setValue, reset]);

  const onSubmit: SubmitHandler<AssignmentDto> = (data) => {
    assignmentService
      .postOne({
        ...data,
        weekNumber: +data.weekNumber,
        sequentialRegions: waveSurfer
          ? Object.values(waveSurfer.regions.list).map(({ start, end }) => ({
              start,
              end,
            }))
          : [],
      })
      .then(() => alert("저장되었습니다."))
      .catch((e) => alert(`오류가 발생했습니다 ${e}`));
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

  const wavesurferContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (watchAssignmentType === "translate") setWaveSurfer(null);
    if (!waveSurfer && wavesurferContainer.current) {
      const waveSurfer = WaveSurfer.create({
        container: wavesurferContainer.current,
        waveColor: chroma("#00462A").alpha(0.5).hex(),
        progressColor: "#00462A",
        plugins: [
          RegionsPlugin.create({
            dragSelection: true,
            slop: 5,
            regions: watchSequentialRegions.map(({ start, end }, idx) => ({
              id: idx.toString(),
              start,
              end,
            })),
          }),
        ],
      });
      setWaveSurfer(waveSurfer);
      waveSurfer.load("/examples/simultaneous.m4a");
      waveSurfer.on("region-update-end", forceUpdate);
    }
  }, [wavesurferContainer, watchAssignmentType]);

  return (
    <main className="p-4 space-y-4">
      <h2>{assignmentId === "new" ? "과제 추가" : "과제 수정"}</h2>
      <form
        className="grid sm:grid-cols-2 gap-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <section className="grid grid-cols-4 gap-2 auto-rows-min">
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
        {watchAssignmentType === "translate" ? (
          <section>
            <TextArea
              label="원문"
              rows={25}
              innerClassName="resize-none h-full"
              {...register("textFile", { required: true })}
            ></TextArea>
            <input type="file" accept=".txt,.docx" onChange={handleFileInput} />
          </section>
        ) : (
          <section className="space-y-2">
            <span className="h-full">
              원음
              <div ref={wavesurferContainer}></div>
            </span>
            {waveSurfer && (
              <>
                <section className="flex gap-1">
                  {Object.values(waveSurfer.regions.list).map((r, idx) => (
                    <button
                      className="btn-sm text-white"
                      key={r.id}
                      style={{ backgroundColor: colorScheme[idx] }}
                      onClick={(e) => {
                        e.preventDefault();
                        r.play();
                      }}
                    >
                      구간{idx + 1}
                    </button>
                  ))}
                </section>
                <section className="flex gap-2">
                  <button
                    className="btn bg-primary text-white mr-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      waveSurfer.playPause();
                    }}
                  >
                    재생 / 일시정지
                  </button>
                  <button
                    className="btn bg-danger text-white"
                    onClick={() => {
                      if (!window.confirm("구간을 전부 삭제합니다.")) return;
                      waveSurfer.regions.clear();
                    }}
                  >
                    전체 삭제
                  </button>
                  <button
                    className="btn rounded-full bg-blue-500 text-white"
                    onClick={() => {
                      console.log(waveSurfer.regions.list);
                      waveSurfer.regions.add({ id: "0", start: 1, end: 2 });
                    }}
                  >
                    구간 추가
                  </button>
                </section>
              </>
            )}
            <input type="file" accept="audio/*" placeholder="원음" />
            <Select
              label="다시 듣기 제한"
              {...register("maxPlayCount", { required: true })}
              options={[{ label: "무제한", value: "0" }]}
            />
          </section>
        )}
        <section className="col-span-full flex gap-2">
          <button
            className="btn bg-secondary-500 text-white"
            onClick={() => {
              waveSurfer?.destroy();
              navigate("..");
            }}
          >
            뒤로가기
          </button>
          <button className="btn bg-primary text-white ml-auto" disabled>
            미리보기
          </button>
          <input
            type="submit"
            value="확인"
            className="btn bg-primary text-white justify-self-end"
          />
        </section>
      </form>
    </main>
  );
}

export default AssignmentForm;
