import { Checkbox, InputField, Select, TextArea } from "@/components/common";
import SequentialForm from "@/components/SequentialForm";
import SimultaneousForm from "@/components/SimultaneousForm";
import TranslationForm from "@/components/TranslationForm";
import { assignmentService } from "@/services";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const assignmentTypeOptions: Option<AssignmentType>[] = [
  { label: "번역", value: "TRANSLATION" },
  { label: "순차 통역", value: "SEQUENTIAL" },
  { label: "동시 통역", value: "SIMULTANEOUS" },
];

type Field = Omit<CreateAssignmentDto, "audioFile" | "sequentialRegions">;

function AssignmentForm() {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, isSubmitted },
  } = useForm<Field>({
    defaultValues: {
      classId: +classId!,
      assignmentType: "TRANSLATION",
      isPublic: false,
      dueDateTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -8),
      textFile: "",
      playbackRate: 1.0,
      maxPlayCount: 0,
    },
  });
  const watchTextFile = watch("textFile", "");
  const watchAssignmentType = watch("assignmentType", "TRANSLATION");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [sequentialRegions, setSequentialRegions] = useState<Region[]>([]);

  useEffect(() => {
    if (assignmentId === "new") return;

    assignmentService
      .getOne(+assignmentId!)
      .then(
        ({
          id,
          feedbackCategories,
          dueDateTime,
          audioFile,
          sequentialRegions,
          ...rest
        }) => {
          reset({
            ...rest,
            feedbackCategoryIds: feedbackCategories.map((f) => f.id),
            dueDateTime: dueDateTime.slice(0, -8),
          } as Field);
          setSequentialRegions(sequentialRegions || []);
          setAudioFile(audioFile);
        }
      );
  }, [assignmentId, reset]);

  const onSubmit: SubmitHandler<Field> = async (data) => {
    try {
      if (assignmentId === "new") {
        await assignmentService.postOne({
          ...data,
          dueDateTime: new Date(
            Date.parse(data.dueDateTime) +
              new Date().getTimezoneOffset() * 60000
          ).toISOString(),
          audioFile,
          weekNumber: +data.weekNumber,
          sequentialRegions,
          feedbackCategoryIds: [],
        });
      } else {
        await assignmentService.patchOne(+assignmentId!, {
          ...data,
          dueDateTime: new Date(
            Date.parse(data.dueDateTime) +
              new Date().getTimezoneOffset() * 60000
          ).toISOString(),
          audioFile,
          weekNumber: +data.weekNumber,
          sequentialRegions,
        });
      }
      toast.success("저장되었습니다.");
    } catch (error) {
      toast.error(`오류가 발생했습니다 ${error}`);
    }
  };

  console.log(sequentialRegions);
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
            required
            {...register("weekNumber")}
            options={[...Array(16)].map((_, idx) => ({
              value: (idx + 1).toString(),
              label: `${idx + 1}주차`,
            }))}
          />
          <InputField
            label="기한"
            className="col-span-2"
            type="datetime-local"
            required
            {...register("dueDateTime")}
          />
          <InputField
            label="과제명"
            className="col-span-3"
            required
            {...register("name")}
          />
          <Select
            label="과제 종류"
            required
            {...register("assignmentType")}
            options={assignmentTypeOptions}
          />
          <InputField
            label="키워드"
            className="col-span-full"
            {...register("keywords")}
          />
          <TextArea
            label="과제 설명"
            className="col-span-4"
            rows={5}
            innerClassName="resize-none"
            required
            {...register("description")}
          ></TextArea>
          {watchAssignmentType !== "TRANSLATION" && (
            <>
              <Select
                label="다시 듣기 제한"
                required
                {...register("maxPlayCount")}
                options={[{ label: "무제한", value: "0" }]}
              />
              <InputField
                label="재생 속도"
                type="number"
                min="0"
                max="2"
                step="0.1"
                required
                {...register("playbackRate")}
              />
            </>
          )}
          <Checkbox
            label="과제 제출물 공개 여부"
            className="col-span-4"
            {...register("isPublic")}
          />
        </section>
        {watchAssignmentType === "TRANSLATION" ? (
          <TranslationForm
            textFile={watchTextFile}
            onTextFileChange={(t) => setValue("textFile", t)}
          />
        ) : watchAssignmentType === "SIMULTANEOUS" ? (
          <SimultaneousForm
            audioFile={audioFile || new Blob([])}
            handleAudioFileChange={(audioFile) => setAudioFile(audioFile)}
          />
        ) : watchAssignmentType === "SEQUENTIAL" ? (
          <SequentialForm
            audioFile={audioFile || new Blob([])}
            handleAudioFileChange={setAudioFile}
            sequentialRegions={sequentialRegions}
            handleSequentialRegionsChange={setSequentialRegions}
          />
        ) : null}
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
            className="btn justify-self-end bg-primary text-white hover:opacity-70"
            disabled={isSubmitting || isSubmitted}
          />
        </section>
      </form>
    </main>
  );
}

export default AssignmentForm;
