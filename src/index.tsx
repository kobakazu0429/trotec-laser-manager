/** @jsx jsx */
/** @jsxFrag Fragment */

import { Hono } from "hono";
import { jsx, type FC } from "hono/jsx";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import { basicAuth } from "hono/basic-auth";
import { TrotecApiClient } from "./trotec/index.ts";

const SPEEDY400_IP_ADDRESS = Deno.env.get("SPEEDY400_IP_ADDRESS");
const EMAIL = Deno.env.get("EMAIL");
const PASSWORD = Deno.env.get("PASSWORD");
const PORT = parseInt(Deno.env.get("PORT")!, 10) || 8000;

if (!SPEEDY400_IP_ADDRESS) {
  throw new Error("SPEEDY400_IP_ADDRESS is not defined");
}
if (!EMAIL) {
  throw new Error("EMAIL is not defined");
}
if (!PASSWORD) {
  throw new Error("PASSWORD is not defined");
}

const app = new Hono();

app.use("*", poweredBy());
app.use("*", logger());

app.use(
  "/admin/*",
  basicAuth({
    username: EMAIL,
    password: PASSWORD,
  })
);

const Layout: FC = (props) => {
  return (
    <html>
      <body>{props.children}</body>
    </html>
  );
};

app.get("/admin", async (c) => {
  const trotec = new TrotecApiClient(SPEEDY400_IP_ADDRESS);
  await trotec.signIn(EMAIL, PASSWORD);
  const { users } = await trotec.getUsers();

  return c.html(
    <Layout>
      <h2>General Infomatino</h2>
      <ul>
        <li>{SPEEDY400_IP_ADDRESS}</li>
        <li>{EMAIL}</li>
        <li>{PASSWORD}</li>
      </ul>

      <h2>Users</h2>
      <table border="1">
        <thead>
          <tr>
            {/* <th>id</th> */}
            <th>email</th>
            <th>name</th>
            <th>roles</th>
            <th>permissions</th>
            <th>active</th>
            {/* <th>updatedOn</th> */}
            <th>createdOn</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr>
              {/* <td>{user.id}</td> */}
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>{user.roles.join(", ")}</td>
              <td>{user.permissions.join(", ")}</td>
              <td>{user.active}</td>
              {/* <td>{user.updatedOn}</td> */}
              <td>{user.createdOn}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Operations</h2>
      <ul>
        <li>
          <a href="/admin/users/delete">Delete All Student Users</a>
        </li>
        <li>
          <a href="/admin/designs/delete">Delete All Designs</a>
        </li>
        <li>
          <a href="/admin/jobs/delete">Delete All Jobs</a>
        </li>
      </ul>
    </Layout>
  );
});

app.get("/admin/users/delete", async (c) => {
  const trotec = new TrotecApiClient(SPEEDY400_IP_ADDRESS);
  await trotec.signIn(EMAIL, PASSWORD);
  const { users } = await trotec.getUsers();
  const studentUsers = users.filter((user) =>
    user.email.startsWith("iwsq-student-")
  );
  await Promise.all(studentUsers.map((user) => trotec.deleteUser(user.id)));

  return c.html(
    <Layout>
      <h2>Successful, Deleted All Students Accounts.</h2>
      <a href="/admin">Back to Admin Top Page</a>
    </Layout>
  );
});

app.get("/admin/designs/delete", async (c) => {
  const trotec = new TrotecApiClient(SPEEDY400_IP_ADDRESS);
  await trotec.signIn(EMAIL, PASSWORD);
  const designs = await trotec.getDesigns();
  const deletableDesignIds = designs
    .filter((design) => !design.isReadOnly)
    .map((desing) => desing.id);
  await trotec.deleteDesigns(deletableDesignIds);

  return c.html(
    <Layout>
      <h2>Successful, Deleted All Designs.</h2>
      <a href="/admin">Back to Admin Top Page</a>
    </Layout>
  );
});

app.get("/admin/jobs/delete", async (c) => {
  const trotec = new TrotecApiClient(SPEEDY400_IP_ADDRESS);
  await trotec.signIn(EMAIL, PASSWORD);
  const jobs = await trotec.getJobs();
  const deletableJobIds = jobs
    .filter((job) => !job.isReadOnly)
    .map((job) => job.id);
  await trotec.deleteJobs(deletableJobIds);

  return c.html(
    <Layout>
      <h2>Successful, Deleted All Jobs.</h2>
      <a href="/admin">Back to Admin Top Page</a>
    </Layout>
  );
});

app.get("/", (c) => {
  return c.html(
    <Layout>
      <h1>Hello Hono!</h1>
      <a href="/user/create">アカウントを作成する</a>
    </Layout>
  );
});

app.get("/user/create", async (c) => {
  const manager = new TrotecApiClient(SPEEDY400_IP_ADDRESS);
  await manager.signIn(EMAIL, PASSWORD);
  const randomEmail = `iwsq-student-${Math.random()
    .toString(36)
    .slice(-8)}@kure-nct.ac.jp`;
  const password = "Student1234";
  await manager.createUser("Student", randomEmail, password);

  const newUser = new TrotecApiClient(SPEEDY400_IP_ADDRESS);
  const newUserData = await newUser.signIn(randomEmail, password);

  await newUser.updateUserPassword(newUserData.id, password, password);
  await newUser.signIn(randomEmail, password);
  await newUser.acceptEula();
  await newUser.signIn(randomEmail, password);
  await newUser.updateUserLanguage();

  return c.html(
    <Layout>
      <h2>
        アカウントの作成に成功しました。下記の情報でログインしてください。
      </h2>
      <ul>
        <li>メールアドレス: {randomEmail}</li>
        <li>パスワード: {password}</li>
      </ul>

      <a href={`https://${SPEEDY400_IP_ADDRESS}:2402/login/`}>ログインする</a>
      <br />
      <a href="/">トップに戻る</a>
    </Layout>
  );
});

Deno.serve({ port: PORT }, app.fetch);
