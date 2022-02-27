import { SequentialSubmission, SimultaneousSubmission } from "@/components";
import { TextArea } from "@/components/common";
import { UserContext } from "@/contexts";
import { assignmentService, submissionService } from "@/services";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "./Loading";

export default function AJAXWrapper() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    (async function () {
      const assignment = await assignmentService.getOne(+assignmentId!);
      setAssignment(assignment);
    })();
  }, [assignmentId]);

  return assignment ? <Submission assignment={assignment} /> : <Loading />;
}

interface SubmissionProps {
  assignment: Assignment;
}
function Submission({ assignment }: SubmissionProps) {
  const { user } = useContext(UserContext);
  const [submissionAudio, setSubmissionAudio] = useState<Blob | null>(null);
  const { register, handleSubmit, reset } = useForm<
    Omit<CreateSubmissionDto, "audioFile">
  >({
    defaultValues: {
      studentId: user!.id,
      textFile: "",
      staged: false,
      assignmentId: assignment.id,
      playCount: 1,
      playbackRate: 1.0,
    },
  });

  async function onSubmit(data: Omit<CreateSubmissionDto, "audioFile">) {
    try {
      await submissionService.postOne({
        ...data,
        audioFile: submissionAudio,
        staged: false,
      });
      toast.success("임시저장되었습니다.");
      reset(data);
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  return (
    <main className="flex max-w-5xl flex-col gap-2 p-4">
      <h2>과제 제출</h2>
      <h3>키워드: {assignment.keywords}</h3>
      {assignment.assignmentType === "TRANSLATION" ? (
        <section className="grid flex-grow grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-2">
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
      ) : assignment.assignmentType === "SEQUENTIAL" ? (
        <SequentialSubmission
          audioFile={assignment.audioFile || new Blob([])}
          sequentialRegions={assignment.sequentialRegions || []}
          submissionAudio={submissionAudio || new Blob([])}
          handleSubmssionAudioChange={(d) => setSubmissionAudio(d)}
        />
      ) : assignment.assignmentType === "SIMULTANEOUS" ? (
        <SimultaneousSubmission
          audioFile={assignment.audioFile || new Blob([])}
          submissionAudio={submissionAudio || new Blob([])}
          handleSubmssionAudioChange={(d) => setSubmissionAudio(d)}
        />
      ) : null}
      <section className="flex justify-end gap-2">
        <button
          className="btn bg-secondary-500 text-white"
          onClick={handleSubmit(onSubmit)}
        >
          임시저장
        </button>
        <button className="btn bg-primary text-white" disabled>
          제출
        </button>
      </section>
    </main>
  );
}
