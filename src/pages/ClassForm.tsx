import Papa from "papaparse";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import XLSX from "xlsx";
import InputField from "../components/common/InputField";
import Select, {
  semesterOptions,
  yearOptions,
} from "../components/common/Select";
import Table from "../components/common/Table";
import CourseModal from "../components/CourseModal";
import { classService, courseService } from "../services/classService";
import userService from "../services/userService";

function ClassForm() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModalVisible, setCourseModalVisible] = useState(false);

  const [year, setYear] = useState<number>(0);
  const [semester, setSemester] = useState<Semester>("spring");
  const [students, setStudents] = useState<User[]>([]);

  const { register, setValue, handleSubmit, reset, watch } = useForm<ClassDto>({
    defaultValues: {
      courseId: 0,
      classNumber: 1,
      professorIds: [],
      studentIds: [],
    },
  });
  const watchCourseId = watch("courseId");
  const watchStudentIds = watch("studentIds");

  const filteredCourses = courses.filter(
    (course) => course.year === year && course.semester === semester
  );

  useEffect(() => {
    Promise.all(watchStudentIds.map((id) => userService.getOne(id))).then(
      (students) => setStudents(students)
    );
  }, [watchStudentIds]);

  useEffect(() => {
    courseService.getAll().then((courses) => setCourses(courses));
    if (classId !== "new") {
      classService.getOne(+classId!).then((data) => {
        setYear(data.course.year);
        setSemester(data.course.semester);
        reset(data);
      });
    }
  }, [classId]);

  useEffect(() => {
    if (watchCourseId === -1) {
      setCourseModalVisible(true);
    }
  }, [watchCourseId]);

  const complete = useCallback(({ data }: Papa.ParseResult<string>) => {
    Promise.all(
      data.slice(1, -1).map(async (d) => {
        const userDto: UserDto = {
          email: d[6],
          collegeName: d[1],
          departmentName: d[2],
          lastName: d[4],
          firstName: d[4],
          academicId: d[3],
          isAdmin: false,
          role: "student",
        };
        const createdUser = await userService.postOne(userDto);
        return createdUser;
      })
    ).then((students) =>
      setValue(
        "studentIds",
        students.map((s) => s.id)
      )
    );
  }, []);

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file.name.match(/.xlsx$/)) {
      file
        .arrayBuffer()
        .then(XLSX.read)
        .then(({ Sheets }) => XLSX.utils.sheet_to_csv(Sheets["Sheet1"]))
        .then((csv) => {
          Papa.parse<string>(csv, {
            complete,
          });
        });
    } else {
      Papa.parse<string>(file, {
        complete,
        encoding: "euc-kr",
      });
    }
  }

  function handlePostCourse({ code, name }: { code: string; name: string }) {
    courseService.postOne({ code, name, year, semester }).then((newCourse) => {
      setCourseModalVisible(false);
      setValue("courseId", newCourse.id);
    });
  }

  const onSubmit: SubmitHandler<ClassDto> = (data) => {
    classService.postOne(data).then(() => {
      alert("성공적으로 등록되었습니다.");
      navigate("/");
    });
  };

  return (
    <main className="p-4 max-w-5xl md:self-start grid grid-rows-[min-content_auto_1fr_min-content] md:grid-rows-[min-content_1fr_min-content] grid-cols-1 md:grid-cols-[1fr_3fr] items-start gap-4">
      <h2 className="col-span-full subtitle">
        {classId === "new" ? "새 강의 분반 추가" : "강의 분반 편집"}
      </h2>
      <section className="grid grid-cols-2 md:grid-cols-1 gap-2">
        <Select
          label="연도"
          disabled={classId !== "new"}
          onChange={(e) => setYear(+e.target.value)}
          value={year}
          options={yearOptions.slice(1)}
        />
        <Select
          label="학기"
          disabled={classId !== "new"}
          onChange={(e) => setSemester(e.target.value as Semester)}
          value={semester}
          options={semesterOptions.slice(1)}
        />
        <Select
          label="강의"
          disabled={classId !== "new"}
          {...register("courseId", { required: true, valueAsNumber: true })}
          options={[
            ...filteredCourses.map((c) => ({
              value: c.id,
              label: c.name,
            })),
            { value: -1, label: "새 강의 추가" },
          ]}
        />
        <Select
          label="분반"
          disabled={classId !== "new"}
          {...register("classNumber", { required: true })}
          options={[...Array(10)].map((_, idx) => ({
            value: (idx + 1).toString(),
            label: `${idx + 1}분반`,
          }))}
        />
        <InputField
          label="담당교수"
          disabled
          {...register("professorIds")}
        ></InputField>
      </section>
      <section className="flex flex-col gap-1">
        <label>수강생 명단</label>
        <div className="h-96 bg-white rounded-md shadow-lg overflow-auto hidden-scrollbar">
          {students.length !== 0 ? (
            <Table
              labels={["단과대학", "학과", "이름", "비고"]}
              columns={["collegeName", "departmentName", "lastName", "role"]}
              data={students}
            />
          ) : (
            <p className="text-center mt-16">등록된 수강생이 없습니다.</p>
          )}
        </div>
        <input type="file" accept=".csv,.xlsx" onChange={handleFileInput} />
      </section>
      <section className="col-span-full flex gap-2 justify-end">
        <button
          className="btn bg-secondary-500 text-white"
          onClick={() => navigate("/")}
        >
          취소
        </button>
        <button
          className="btn bg-primary text-white"
          onClick={handleSubmit(onSubmit)}
        >
          확인
        </button>
      </section>
      <CourseModal
        visible={courseModalVisible}
        onSubmit={handlePostCourse}
        onCancel={() => {
          setValue("courseId", courses[0].id);
          setCourseModalVisible(false);
        }}
      />
    </main>
  );
}

export default ClassForm;
