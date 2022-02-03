import httpService from "./httpService";

const departmentService = {
  async getAll(): Promise<Department[]> {
    const { data: departments } = await httpService.get<Department[]>(
      "departments"
    );
    return departments;
  },

  async getOne(id: number): Promise<Department> {
    const { data: department } = await httpService.get<Department>(
      `departments/${id}`
    );
    return department;
  },

  async postOne(createDepartmentDto: CreateDepartmentDto) {
    const { data: department } = await httpService.post<Department>(
      "departments",
      createDepartmentDto
    );
    return department;
  },

  async patchOne(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const { data: department } = await httpService.patch<Department>(
      `departments/${id}`,
      updateDepartmentDto
    );
    return department;
  },

  async deleteOne(id: number) {
    const { data: department } = await httpService.delete<Department>(
      `departments/${id}`
    );
    return department;
  },
};

export default departmentService;
