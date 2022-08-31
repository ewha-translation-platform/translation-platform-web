import { SequentialSubmission, SimultaneousSubmission } from "@/components";
import { TextArea } from "@/components/common";
import { UserContext } from "@/contexts";
import { assignmentService, submissionService } from "@/services";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const [submissionAudio, setSubmissionAudio] = useState<Blob | null>(null);
  const [submissionRegions, setSubmissionRegions] = useState<Region[] | null>(
    []
  );
  const [isAudioDirty, setIsAudioDirty] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
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
      if (!submission) return;
      const {
        id,
        assignment,
        audioFile,
        textFile,
        playCount,
        playbackRate,
        sequentialRegions,
      } = submission;
      setSubmissionId(id);
      setSubmissionAudio(audioFile);
      setSubmissionRegions(sequentialRegions);
      reset({
        assignmentId: assignment.id,
        studentId: user!.id,
        textFile,
        playCount,
        playbackRate,
      } as Omit<CreateSubmissionDto, "audioFile">);
    });
  }, [assignment.id, reset, user]);

  async function onSubmit(data: Omit<CreateSubmissionDto, "audioFile">) {
    setDisabled(true);
    try {
      const toastId = toast.loading("Loading...");
      if (!submissionId) {
        const submission = await submissionService.postOne({
          ...data,
          audioFile: submissionAudio,
          sequentialRegions: submissionRegions,
          staged: false,
        });
        setSubmissionId(submission.id);
      } else {
        await submissionService.patchOne(submissionId, {
          textFile: data.textFile,
          playCount: data.playCount,
          playbackRate: data.playbackRate,
          audioFile: submissionAudio,
          sequentialRegions: submissionRegions,
          staged: false,
        });
      }
      toast.dismiss(toastId);
      toast.success("임시저장되었습니다.");
      reset(data);
      setDisabled(false);
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  function stageSubmission() {
    setDisabled(true);
    const toastId = toast.loading("Loading...");
    if (submissionId) {
      submissionService
        .stage(submissionId)
        .then(() => {
          toast.dismiss(toastId);
          toast.success("과제를 제출했습니다.");
          setDisabled(false);
          navigate(-1);
        })
        .catch((err) => toast.error(err.message));
    }
  }

  function handleSubmissionAudioChange(d: Blob | null) {
    setSubmissionAudio(d);
    setIsAudioDirty(true);
  }

  function result() {
    setDisabled(true);
    if (submissionId) {
      // submissionService
      //   .stage(submissionId + 1)
      //   .then(() => {
      setDisabled(false);
      // navigate(`/assignments/${assignment.id}/submissions`);
      navigate(`/submissions/${[submissionId + 1]}`);
      // })
      // .catch((err) => toast.error("과제를 먼저 제출해주세요."));
    }
  }

  return (
    <main className="flex max-w-5xl flex-col gap-2 overflow-auto p-4">
      <h2>과제 제출</h2>
      <h3>키워드: {assignment.keywords}</h3>
      <p className="font-semibold underline">반드시 임시저장 후 제출하세요.</p>
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
          submissionRegions={submissionRegions || []}
          submissionAudio={submissionAudio || new Blob([])}
          handleSubmssionAudioChange={handleSubmissionAudioChange}
          handleSubmissionRegionsChange={setSubmissionRegions}
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
          type="button"
          className="btn bg-primary text-white"
          disabled={!submissionId || disabled}
          onClick={result}
        >
          피드백 보기
        </button>
        <button
          className="btn bg-primary text-white"
          onClick={handleSubmit(onSubmit)}
          disabled={!(isDirty || isAudioDirty) || disabled}
        >
          임시저장
        </button>
        <button
          type="button"
          className="btn bg-primary text-white"
          disabled={!submissionId || disabled}
          onClick={stageSubmission}
        >
          제출
        </button>
      </section>
    </main>
  );
}
