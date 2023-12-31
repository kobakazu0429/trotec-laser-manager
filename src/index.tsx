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
      <head>
        <link rel="icon" href="data:,"></link>
        <title>trotec-laser-manager</title>
        <style>
          {`
            clipboard-copy {
              -webkit-appearance: button;
              -moz-appearance: button;
              padding: 0.4em 0.6em;
              font: 0.9rem system-ui, sans-serif;
              display: inline-block;
              cursor: default;
              color: rgb(36, 41, 47);
              background: rgb(246, 248, 250);
              border-radius: 6px;
              border: 1px solid rgba(31, 35, 40, 0.15);
              box-shadow: rgba(31, 35, 40, 0.04) 0 1px 0 0, rgba(255, 255, 255, 0.25) 0 1 0 0 inset;
            }
            clipboard-copy:hover {
              background: rgb(243, 244, 246);
            }
            clipboard-copy:active {
              background: #ebecf0;
            }
              clipboard-copy:focus-visible {
              outline: 2px solid #0969da;
            }
          `}
        </style>
      </head>
      <body>
        {props.children}
        <script
          type="module"
          src="https://esm.sh/@github/clipboard-copy-element"
        ></script>
      </body>
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
        <li>
          <a href="/admin/queue/delete">Delete All Queue</a>
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

app.get("/admin/queue/delete", async (c) => {
  const trotec = new TrotecApiClient(SPEEDY400_IP_ADDRESS);
  await trotec.signIn(EMAIL, PASSWORD);
  await trotec.clearQueue();

  return c.html(
    <Layout>
      <h2>Successful, Deleted All Queue.</h2>
      <a href="/admin">Back to Admin Top Page</a>
    </Layout>
  );
});

app.get("/", (c) => {
  return c.html(
    <Layout>
      <h1>Trotec Laser Manager</h1>
      <a href="/user/create">アカウントを作成する</a>
      <br />
      <br />
      <a href="/admin">管理画面 (TA専用)</a>
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
  const newUserData = await manager.createUser(
    "Student",
    randomEmail,
    password
  );

  const newUser = new TrotecApiClient(SPEEDY400_IP_ADDRESS);
  await newUser.signIn(randomEmail, password);

  await newUser.updateUserPassword(newUserData.id, password, password);
  await newUser.signIn(randomEmail, password);
  await newUser.acceptEula();
  await newUser.signIn(randomEmail, password);
  await newUser.updateUserLanguage();
  await manager.updateUserData({
    userId: newUserData.id,
    email: newUserData.email,
    name: newUserData.name,
    createdOn: newUserData.createdOn,
    isCanModifyMdb: false,
  });

  return c.html(
    <Layout>
      <h2>
        アカウントの作成に成功しました。下記の情報でログインしてください。
      </h2>
      <ul>
        <li>
          メールアドレス: {randomEmail}{" "}
          <clipboard-copy value={randomEmail}>Copy</clipboard-copy>
        </li>
        <li>
          パスワード: {password}{" "}
          <clipboard-copy value={password}>Copy</clipboard-copy>
        </li>
      </ul>

      <a href={`https://${SPEEDY400_IP_ADDRESS}:2402/login/`} target="_blank">
        ログインする
      </a>
      <br />
      <a href="/">トップに戻る</a>
    </Layout>
  );
});

Deno.serve({ port: PORT }, app.fetch);
