import { TextArea } from "@/components/common";
import { UserContext } from "@/contexts";
import { useForceUpdate } from "@/hooks";
import { assignmentService, submissionService } from "@/services";
import chroma from "chroma-js";
import {
  RefCallback,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import WaveSurfer from "wavesurfer.js";
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
  const forceUpdate = useForceUpdate();
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer>();
  const audioFile = useRef<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<Omit<CreateSubmissionDto, "audioFile">>({
    defaultValues: {
      studentId: user!.id,
      textFile: "",
      staged: false,
    },
  });

  const audioContainerRef: RefCallback<HTMLDivElement> = useCallback(
    (node) => {
      if (node) {
        const waveSurfer = WaveSurfer.create({
          container: node,
          waveColor: chroma("#00462A").alpha(0.5).hex(),
          progressColor: "#00462A",
        });
        waveSurfer.load(
          URL.createObjectURL(assignment.audioFile || new Blob([]))
        );
        waveSurfer.on("ready", forceUpdate);
        setWaveSurfer(waveSurfer);
      }
    },
    [forceUpdate, assignment]
  );

  useEffect(() => {
    return () => {
      waveSurfer?.destroy();
    };
  }, [waveSurfer]);

  async function temporalSubmit(data: Omit<CreateSubmissionDto, "audioFile">) {
    try {
      await submissionService.postOne({
        ...data,
        audioFile: audioFile.current,
        staged: false,
      });
      toast.success("임시저장되었습니다.");
      reset(data);
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  async function nonTemporalSubmit(
    data: Omit<CreateSubmissionDto, "audioFile">
  ) {
    try {
      await submissionService.postOne({
        ...data,
        audioFile: audioFile.current,
        staged: true,
      });
      toast.success("제출되었습니다.");
      reset(data);
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  return (
    <main className="grid max-w-5xl grid-rows-[min-content_1fr_min-content] gap-2 p-4">
      <h2 className="col-span-full">과제 제출</h2>
      {assignment.assignmentType === "TRANSLATION" ? (
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
            <div ref={audioContainerRef}></div>
          </label>
          {waveSurfer?.isReady && (
            <section className="flex gap-2">
              <button
                className="btn bg-primary mr-auto text-white"
                onClick={(e) => {
                  e.preventDefault();
                  waveSurfer.playPause();
                }}
              >
                재생 / 일시정지
              </button>
            </section>
          )}
          <label className="flex flex-col">
            제출
            <button className="btn bg-orange-500 text-white">시작</button>
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
