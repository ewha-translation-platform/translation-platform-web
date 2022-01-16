const userService = {
  async getAll(): Promise<User[]> {
    return Promise.resolve(users);
  },
  async getOne(id: number): Promise<User> {
    return Promise.resolve(users[id]);
  },
  async postMany(userDtos: UserDto[]): Promise<User[]> {
    const newUsers = await Promise.all(
      userDtos.map(async (userDto) => await this.postOne(userDto))
    );
    return Promise.resolve(newUsers);
  },
  async postOne(userDto: UserDto): Promise<User> {
    const oldUser = users.find((u) => u.academicId === userDto.academicId);
    if (oldUser) {
      return Promise.resolve(oldUser);
    } else {
      const newUser = { id: users.length, ...userDto };
      users.push(newUser);
      return Promise.resolve(newUser);
    }
  },
};
export default userService;

export let users: UserModel[] = [
  {
    id: 0,
    academicId: "2022000000",
    collegeName: "통역번역대학원",
    departmentName: "한일통역전공",
    email: "test@test.com",
    firstName: "화연",
    lastName: "이",
    isAdmin: false,
    role: "professor",
  },
  {
    id: 1,
    academicId: "2022111111",
    collegeName: "통역번역대학원",
    departmentName: "한일통역전공",
    email: "test@test.com",
    firstName: "이화1",
    lastName: "김",
    isAdmin: false,
    role: "student",
  },
  {
    id: 2,
    academicId: "2022111112",
    collegeName: "통역번역대학원",
    departmentName: "한일통역전공",
    email: "test@test.com",
    firstName: "이화2",
    lastName: "김",
    isAdmin: false,
    role: "student",
  },
  {
    id: 3,
    academicId: "2022111113",
    collegeName: "통역번역대학원",
    departmentName: "한일통역전공",
    email: "test@test.com",
    firstName: "이화3",
    lastName: "김",
    isAdmin: false,
    role: "student",
  },
];
