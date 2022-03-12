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
  const [disabled, setDisabled] = useState(false);
  const [submissionAudio, setSubmissionAudio] = useState<Blob | null>(null);
  const [isAudioDirty, setIsAudioDirty] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitted, isSubmitting, isDirty },
  } = useForm<Omit<CreateSubmissionDto, "audioFile">>({
    defaultValues: {
      studentId: user!.id,
      textFile: "",
      staged: false,
      assignmentId: assignment.id,
      playCount: 1,
      playbackRate: 1.0,
    },
  });

  useEffect(() => {
    assignmentService.getMySubmission(assignment.id).then((submission) => {
      if (!!submission) {
        setSubmissionId(submission.id);
        reset(submission);
      }
    });
  }, [assignment.id, reset]);

  async function onSubmit(data: Omit<CreateSubmissionDto, "audioFile">) {
    try {
      if (!submissionId) {
        await submissionService.postOne({
          ...data,
          audioFile: submissionAudio,
          staged: false,
        });
      } else {
        await submissionService.patchOne(submissionId, {
          textFile: data.textFile,
          playCount: data.playCount,
          playbackRate: data.playbackRate,
          audioFile: submissionAudio,
          staged: false,
        });
      }
      toast.success("임시저장되었습니다.");
      reset(data);
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  function stageSubmission() {
    setDisabled(true);
    if (submissionId) {
      submissionService
        .stage(submissionId)
        .then(() => {
          toast.success("과제를 제출했습니다.");
          setDisabled(false);
        })
        .catch((err) => toast.error(err.message));
    }
  }

  function handleSubmissionAudioChange(d: Blob | null) {
    setSubmissionAudio(d);
    console.log(d);
    setIsAudioDirty(true);
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
          handleSubmssionAudioChange={handleSubmissionAudioChange}
        />
      ) : assignment.assignmentType === "SIMULTANEOUS" ? (
        <SimultaneousSubmission
          audioFile={assignment.audioFile || new Blob([])}
          submissionAudio={submissionAudio || new Blob([])}
          handleSubmssionAudioChange={handleSubmissionAudioChange}
        />
      ) : null}
      <section className="flex justify-end gap-2">
        <button
          className="btn bg-secondary-500 text-white"
          onClick={handleSubmit(onSubmit)}
          disabled={!(isDirty || isAudioDirty)}
        >
          임시저장
        </button>
        <button
          className="btn bg-primary text-white"
          disabled={!submissionId || disabled}
          onClick={(e) => {
            e.preventDefault();
            stageSubmission();
          }}
        >
          제출
        </button>
      </section>
    </main>
  );
}
