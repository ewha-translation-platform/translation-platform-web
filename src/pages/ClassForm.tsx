import Papa from "papaparse";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import XLSX from "xlsx";
import { CourseModal } from "@/components";
import { Select, Table, CreatableSelect } from "@/components/common";
import { semesterOptions, yearOptions } from "@/utils";
import { classService, courseService, userService } from "@/services";
import { UserContext } from "@/contexts";
import { toast } from "react-toastify";
import departmentService from "@/services/departmentService";

function ClassForm() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { classId } = useParams<{ classId: string }>();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModalVisible, setCourseModalVisible] = useState(false);

  const [department, setDepartment] = useState<Department | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState<Semester>("SPRING");

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          department &&
          course.department.id === department.id &&
          course.year === year &&
          course.semester === semester
      ),
    [courses, year, semester, department]
  );

  const [students, setStudents] = useState<User[]>([]);

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateClassDto>({
    defaultValues: { courseId: 0, classNumber: 1 },
  });

  useEffect(() => {
    (async function () {
      const departments = await departmentService.getAll();
      setDepartments(departments);

      const courses = await courseService.getAll();
      setCourses(courses);

      if (classId !== "new") {
        const classInfo = await classService.getOne(+classId!);
        setYear(classInfo.course.year);
        setSemester(classInfo.course.semester);
        reset(classInfo);
      }
    })();
  }, [classId, reset]);

  async function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    function complete({ data }: Papa.ParseResult<string>) {
      setValue(
        "studentIds",
        data.slice(1, -1).map((d) => d[3])
      );
      // Promise.all(
      //   data.slice(1, -1).map(async (d) => {
      //     const createUserDto: CreateUserDto = {
      //       email: d[6],
      //       password: d[3],
      //       lastName: d[4],
      //       firstName: d[4],
      //       id: d[3],
      //       role: "STUDENT",
      //       // college: d[1],
      //       // department: d[2],
      //     };
      //     const createdUser = await userService.postOne(createUserDto);
      //     return createdUser;
      //   })
      // ).then((students) =>
      //   setValue(
      //     "studentIds",
      //     students.map((s) => s.id)
      //   )
      // );
    }
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file.name.match(/.xlsx$/)) {
      await file
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

  async function handlePostCourse(code: string, name: string) {
    if (!department) {
      return toast.warning("개설학과를 선택해주세요.");
    }
    try {
      const newCourse = await courseService.postOne({
        code,
        name,
        year,
        semester,
        departmentId: department.id,
      });
      setCourseModalVisible(false);
      setCourses((courses) => [...courses, newCourse]);
      setValue("courseId", newCourse.id);
      toast.success("강의가 성공적으로 등록되었습니다.");
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  async function onSubmit(data: CreateClassDto) {
    try {
      await classService.postOne(data);
      toast.success("강의 분반이 성공적으로 등록되었습니다.");
      navigate("/");
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  return (
    <main className="p-4 max-w-5xl grid sm:grid-rows-[auto_minmax(0,100%)] sm:grid-cols-3 gap-4">
      <nav className="col-span-full flex gap-2">
        <h2 className="mr-auto">
          {classId === "new" ? "새 강의 분반 추가" : "강의 분반 편집"}
        </h2>
        <button
          className="btn bg-secondary-500 text-white"
          onClick={() => navigate("/")}
        >
          취소
        </button>
        <button
          className="btn bg-primary text-white"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          저장
        </button>
      </nav>
      <section className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="연도"
            disabled={classId !== "new"}
            onChange={(e) => {
              setYear(+e.target.value);
            }}
            value={year}
            options={yearOptions.slice(1)}
          />
          <Select
            label="학기"
            disabled={classId !== "new"}
            onChange={(e) => {
              setSemester(e.target.value as Semester);
            }}
            value={semester}
            options={semesterOptions.slice(1)}
          />
        </div>
        <label className="flex flex-col gap-1">
          개설학과
          <CreatableSelect<Option<number>, false>
            options={departments.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            placeholder=""
            onCreateOption={async (newDepartmentName) => {
              if (
                window.confirm(
                  `학과 "${newDepartmentName}"을(를) 추가하시겠습니까?`
                )
              ) {
                try {
                  const department = await departmentService.postOne({
                    name: newDepartmentName,
                    collegeName: "통역번역대학원",
                  });
                  setDepartments((depts) => [...depts, department]);
                  setDepartment(department);
                  toast.success("학과를 추가하였습니다.");
                } catch (e) {
                  toast.error(JSON.stringify(e));
                }
              }
            }}
            onChange={(newValue) => {
              setDepartment(
                newValue && departments.find((d) => d.id === newValue.value)!
              );
            }}
            value={
              department && {
                value: department.id,
                label: department.name,
              }
            }
          />
        </label>
        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <Select
            label="강의"
            disabled={classId !== "new" || filteredCourses.length === 0}
            {...register("courseId", { required: true, valueAsNumber: true })}
            options={filteredCourses.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
          <button
            className="py-2 px-4 bg-primary text-white rounded-md border border-primary hover:opacity-70 disabled:hover:opacity-30"
            disabled={!department}
            onClick={() => setCourseModalVisible(true)}
          >
            새 강의 추가
          </button>
        </div>
        <Select
          label="분반"
          disabled={classId !== "new"}
          {...register("classNumber", { required: true })}
          options={[...Array(10)].map((_, idx) => ({
            value: (idx + 1).toString(),
            label: `${idx + 1}분반`,
          }))}
        />
        {/* <Select
          label="담당교수"
          {...register("professorIds")}
          disabled
          options={[
            { label: user!.lastName + user!.firstName, value: user!.id },
          ]}
        /> */}
      </section>
      <section className="sm:col-span-2 flex flex-col gap-2">
        <label>수강생 명단</label>
        <div className="min-h-[16rem] bg-white rounded-md shadow-lg overflow-auto hidden-scrollbar">
          {students.length !== 0 ? (
            <Table
              labels={["단과대학", "학과", "이름", "비고"]}
              columns={["college", "department", "lastName", "role"]}
              data={students}
            />
          ) : (
            <p className="text-center mt-16">등록된 수강생이 없습니다.</p>
          )}
        </div>
        <input type="file" accept=".csv,.xlsx" onChange={handleFileInput} />
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
