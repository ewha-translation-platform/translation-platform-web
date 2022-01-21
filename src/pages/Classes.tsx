import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ClassCard, NewItemCard } from "@/components";
import { InputField, Select } from "@/components/common";
import { semesterOptions, yearOptions } from "@/utils";
import { UserContext } from "@/contexts";
import { useSearch } from "@/hooks";
import { classService } from "@/services";

type FilterFields = {
  year: number | "";
  semester: Semester | "";
  query: string;
};

function Classes() {
  const { user } = useContext(UserContext);
  const [classes, setClasses] = useState<Class[]>([]);

  const { register, watch } = useForm<FilterFields>({
    defaultValues: { year: 0, semester: "", query: "" },
  });
  const watchYear = watch("year");
  const watchSemester = watch("semester");
  const watchQuery = watch("query");

  const filteredClasses = classes
    .filter(({ course }) => !watchYear || watchYear === course.year)
    .filter(
      ({ course }) => !watchSemester || watchSemester === course.semester
    );
  const searchedClasses = useSearch<Class>(
    filteredClasses,
    watchQuery,
    (item) => item.course.name
  );

  useEffect(() => {
    classService.getAll().then((data) => setClasses(data));
  }, []);

  function handleDelete(targetId: number) {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      const olds = classes;
      setClasses(classes.filter((item) => item.id !== targetId));
      classService.deleteOne(targetId).catch(() => setClasses(olds));
    }
  }

  return (
    <main className="p-4 space-y-4">
      <h2>강의 목록</h2>
      <form className="max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Select
          label="연도"
          options={yearOptions}
          {...register("year", { valueAsNumber: true })}
        />
        <Select
          label="학기"
          options={semesterOptions}
          {...register("semester")}
        />
        <InputField
          label="검색어"
          className="col-span-full sm:col-span-2"
          {...register("query")}
        />
      </form>
      <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
        {classes &&
          searchedClasses.map((item) => (
            <ClassCard
              key={item.id}
              classInfo={item}
              onDelete={() => handleDelete(item.id)}
              displayActions={user?.role === "professor"}
            />
          ))}
        {user?.role === "professor" && <NewItemCard />}
      </ul>
    </main>
  );
}

export default Classes;
