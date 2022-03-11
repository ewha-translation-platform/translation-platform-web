import { CourseModal } from "@/components";
import {
  CreatableSelect,
  MultiSelect,
  Select,
  Table,
} from "@/components/common";
import { UserContext } from "@/contexts";
import {
  classService,
  courseService,
  departmentService,
  userService,
} from "@/services";
import { semesterOptions, yearOptions } from "@/utils";
import Papa from "papaparse";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import XLSX from "xlsx";

function ClassForm() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { classId } = useParams<{ classId: string }>();

  const [professors, setProfessors] = useState<Required<User>[]>([]);
  const [students, setStudents] = useState<Required<User>[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModalVisible, setCourseModalVisible] = useState(false);

  const filterFormMethods = useForm<{
    year: number;
    semester: Semester;
    department: Department;
  }>({
    defaultValues: {
      year: new Date().getFullYear(),
      semester: "SPRING",
    },
  });
  const year = filterFormMethods.watch("year", 2022);
  const semester = filterFormMethods.watch("semester", "SPRING");
  const department = filterFormMethods.watch("department");

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<CreateClassDto>({
    defaultValues: { classNumber: 1, professorIds: [user!.id], studentIds: [] },
  });
  const watchProfessorIds = watch("professorIds");

  async function onSubmit(data: CreateClassDto) {
    try {
      await classService.postOne(data);
      toast.success("강의 분반이 성공적으로 등록되었습니다.");
      navigate("/");
    } catch (e) {
      toast.error(`에러가 발생하였습니다. ${e}`);
    }
  }

  useEffect(() => {
    (async function () {
      const professors = await userService.findProfessorsWithName("");
      setProfessors(professors);

      const departments = await departmentService.getAll();
      setDepartments(departments);
      filterFormMethods.setValue("department", departments[0]);

      const courses = await courseService.getAll();
      setCourses(courses);

      if (classId !== "new") {
        const classInfo = await classService.getOne(+classId!);
        filterFormMethods.reset({ ...classInfo.course });
        reset(classInfo);
      }
    })();
  }, [classId, reset, filterFormMethods]);

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

  return (
    <main className="grid max-w-5xl gap-4 p-4 sm:grid-cols-[1fr_2fr] sm:grid-rows-[auto_minmax(0,100%)]">
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
      <section className="grid auto-rows-min gap-2 sm:grid-cols-2">
        <Select
          label="연도"
          disabled={classId !== "new"}
          options={yearOptions.slice(1)}
          {...filterFormMethods.register("year")}
        />
        <Select
          label="학기"
          disabled={classId !== "new"}
          options={semesterOptions.slice(1)}
          {...filterFormMethods.register("semester")}
        />
        <CreatableSelect<Option<number>, false>
          label="개설학과"
          className="col-span-full"
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
                filterFormMethods.setValue("department", department);
                toast.success("학과를 추가하였습니다.");
              } catch (e) {
                toast.error(JSON.stringify(e));
              }
            }
          }}
          onChange={(newValue) => {
            if (!newValue) return;
            filterFormMethods.setValue(
              "department",
              departments.find((d) => d.id === newValue.value)!
            );
          }}
          value={
            department && {
              value: department.id,
              label: department.name,
            }
          }
        />
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
          className="border-primary bg-primary self-end rounded-md border py-2 px-4 text-white hover:opacity-70 disabled:hover:opacity-30"
          disabled={!department}
          onClick={() => setCourseModalVisible(true)}
        >
          새 강의 추가
        </button>
        <Select
          className="col-span-full"
          label="분반"
          disabled={classId !== "new"}
          {...register("classNumber", { required: true })}
          options={[...Array(10)].map((_, idx) => ({
            value: (idx + 1).toString(),
            label: `${idx + 1}분반`,
          }))}
        />
        <MultiSelect<Option<string>>
          label="담당교수"
          className="col-span-full"
          isSearchable
          options={professors.map((p) => ({
            value: p.academicId,
            label: `${p.department} ${p.lastName}${p.firstName}`,
          }))}
          value={professors
            .filter((p) => watchProfessorIds?.includes(p.academicId))
            .map((p) => ({
              value: p.academicId,
              label: `${p.department} ${p.lastName}${p.firstName}`,
            }))}
          onChange={(value) => console.log(value)}
          placeholder="담당교수를 선택하세요"
        />
      </section>
      <section className="flex flex-col gap-2">
        <label>수강생 명단</label>
        <div className="hidden-scrollbar min-h-[16rem] overflow-auto rounded-md bg-white shadow-lg">
          {students.length !== 0 ? (
            <Table
              labels={["단과대학", "학과", "이름", "비고"]}
              columns={["college", "department", "lastName", "role"]}
              data={students}
            />
          ) : (
            <p className="mt-16 text-center">등록된 수강생이 없습니다.</p>
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

  async function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    function complete({ data }: Papa.ParseResult<string>) {
      const students: Required<User>[] = data.slice(1, -1).map((d) => ({
        id: -1,
        email: d[6],
        lastName: d[4],
        firstName: d[4],
        academicId: d[3],
        role: "STUDENT",
        college: d[1],
        department: d[2],
        isAdmin: false,
      }));
      setStudents(students);
      setValue(
        "studentIds",
        students.map((s) => s.academicId)
      );
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
}

export default ClassForm;
