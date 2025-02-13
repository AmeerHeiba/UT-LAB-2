const request = require("supertest");
const app = require("../..");
const { clearDatabase } = require("../../db.connection");

const req = request(app);
fdescribe("todo routes:", () => {
  let mockUser, userToken, todoInDB;
  beforeAll(async () => {
    mockUser = { name: "Ahmed", email: "ahmed@asd.com", password: "1234" };
    await req.post("/user/signup").send(mockUser);
    let res = await req.post("/user/login").send(mockUser);
    userToken = res.body.data;
  });
  afterAll(async () => {
    await clearDatabase();
  });
  it("get req(/todo): should get todo=[]", async () => {
    let res = await req.get("/todo");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveSize(0);
  });
  it("post req(/todo): should not add todo with not auth user", async () => {
    let res = await req.post("/todo").send({ title: "playing" });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("please login first");
  });
  it("post req(/todo): should add todo with auth user", async () => {
    let res = await req
      .post("/todo")
      .send({ title: "playing" })
      .set({ authorization: userToken });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("playing");
    todoInDB = res.body.data;
  });
  it("get req(/todo/id): should get the just add todo", async () => {
    let res = await req
      .get("/todo/" + todoInDB._id)
      .set({ authorization: userToken });
    expect(res.body.data).toEqual(todoInDB);
  });
});
