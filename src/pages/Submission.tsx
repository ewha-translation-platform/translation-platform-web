import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { TextArea } from "@/components/common";
import { assignmentService, submissionService } from "@/services";

function Submission() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const { register, handleSubmit } = useForm<SubmissionDto>({
    defaultValues: {
      studentId: 0,
      textFile: "",
      playCount: 0,
      playbackRate: 1,
      generalReview: "",
      isGraded: false,
      score: 0,
      feedbackIds: [],
    },
  });
  const onSubmit: SubmitHandler<SubmissionDto> = (data) => {
    submissionService.postOne(data).then(() => alert("제출되었습니다."));
  };

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
            <button className="btn btn-secondary">시작</button>
          </label>
        </>
      )}
      <section className="col-span-full flex justify-end gap-2">
        <button className="btn bg-secondary-500 text-white">임시저장</button>
        <button
          className="btn bg-primary text-white"
          onClick={handleSubmit(onSubmit)}
        >
          제출
        </button>
      </section>
    </main>
  );
}

export default Submission;
