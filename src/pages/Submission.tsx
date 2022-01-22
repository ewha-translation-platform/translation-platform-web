import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { TextArea } from "@/components/common";
import { assignmentService, submissionService } from "@/services";
import { toast } from "react-toastify";
import { UserContext } from "@/contexts";

function Submission() {
  const { user } = useContext(UserContext);
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<CreateSubmissionDto>({
    defaultValues: {
      studentId: user!.id,
      textFile: "",
      playCount: 0,
      playbackRate: 1,
      isTemporal: true,
    },
  });

  async function temporalSubmit(data: CreateSubmissionDto) {
    try {
      await submissionService.postOne({ ...data, isTemporal: true });
      toast.success("임시저장되었습니다.");
      reset(data);
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  async function nonTemporalSubmit(data: CreateSubmissionDto) {
    try {
      await submissionService.postOne({ ...data, isTemporal: false });
      toast.success("제출되었습니다.");
      reset(data);
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  useEffect(() => {
    assignmentService
      .getOne(+assignmentId!)
      .then((data) => setAssignment(data));
  }, [assignmentId]);

  if (!assignment) return <span>Loading...</span>;
  return (
    <main className="p-4 max-w-5xl grid grid-rows-[min-content_1fr_min-content] gap-2">
      <h2 className="col-span-full">과제 제출</h2>
      {assignment.assignmentType === "translate" ? (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-2">
          <TextArea
            label="원문"
            className="text-xl"
            innerClassName="resize-none h-full"
            readOnly
            value={assignment.textFile}
          ></TextArea>
          <TextArea
            label="번역문"
            className="text-xl"
            innerClassName="resize-none h-full"
            {...register("textFile", { required: true })}
          ></TextArea>
        </section>
      ) : (
        <>
          <label className="flex flex-col">
            원음
            <audio src="/simultaneous-example.m4a" controls></audio>
          </label>
          <label className="flex flex-col">
            제출
            <button className="btn text-white">시작</button>
          </label>
        </>
      )}
      <section className="flex justify-end gap-2">
        <button
          className="btn bg-secondary-500 text-white"
          onClick={handleSubmit(temporalSubmit)}
          disabled={isSubmitting || !isDirty}
        >
          임시저장
        </button>
        <button
          className="btn bg-primary text-white"
          onClick={handleSubmit(nonTemporalSubmit)}
          disabled={isSubmitting}
        >
          제출
        </button>
      </section>
    </main>
  );
}

export default Submission;
