import httpService from "./httpService";

const userService = {
  async getAll(): Promise<User[]> {
    const { data: users } = await httpService.get<User[]>("users");
    return users;
  },

  async getOne(id: string): Promise<User> {
    const { data: user } = await httpService.get<User>(`users/${id}`);
    return user;
  },

  async postMany(createUserDtos: CreateUserDto[]): Promise<User[]> {
    const users = await Promise.all(
      createUserDtos.map(async (createUserDto) => {
        const { data: user } = await httpService.post<User>(
          "users",
          createUserDto
        );
        return user;
      })
    );
    return users;
  },

  async postOne(createUserDto: CreateUserDto): Promise<User> {
    const { data: user } = await httpService.post<User>("users", createUserDto);
    return user;
  },

  async findProfessorsWithName(name: string): Promise<User[]> {
    const { data: users } = await httpService.get<User[]>("users", {
      params: { name, role: "PROFESSOR" },
    });
    return users;
  },
};
export default userService;
