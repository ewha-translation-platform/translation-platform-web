import cheerio from "cheerio";
import JSZip from "jszip";
import { ChangeEvent, useCallback, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Checkbox from "../components/common/Checkbox";
import InputField from "../components/common/InputField";
import Select from "../components/common/Select";
import TextArea from "../components/common/TextArea";
import assignmentService from "../services/assignmentService";

const assignmentTypeOptions = [
  { label: "번역", value: "translate" },
  { label: "순차 통역", value: "sequential" },
  { label: "동시 통역", value: "simultaneous" },
];

function AssignmentForm() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, reset } =
    useForm<AssignmentDto>({
      defaultValues: {
        assignmentType: "translate",
        isPublic: false,
        dueDateTime: new Date().toISOString().slice(0, -8),
      },
    });

  useEffect(() => {
    if (assignmentId !== "new") {
      assignmentService.getOne(+assignmentId!).then(reset);
    }
  }, [assignmentId, setValue, reset]);

  const onSubmit: SubmitHandler<AssignmentDto> = (data) => {
    assignmentService.postOne(data).then(() => navigate(".."));
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
        <section>
          {watch("assignmentType") === "translate" ? (
            <>
              <TextArea
                label="원문"
                rows={25}
                innerClassName="resize-none h-full"
                {...register("textFile", { required: true })}
              ></TextArea>
              <input
                type="file"
                accept=".txt,.docx"
                onChange={handleFileInput}
              />
            </>
          ) : (
            <>
              <label className="col-span-2">
                원음
                <audio
                  src="/simultaneous-example.m4a"
                  controls
                  className="w-full"
                ></audio>
                <input type="file" accept="audio/*" placeholder="원음" />
              </label>
              <Select
                label="다시 듣기 제한"
                {...register("maxPlayCount", { required: true })}
                options={[{ label: "무제한", value: "0" }]}
              />
            </>
          )}
        </section>
        <section className="col-span-full flex gap-2">
          <button
            className="btn bg-secondary-500 text-white"
            onClick={() => navigate("..")}
          >
            취소
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
