import type {
  SignInResponse,
  GetUsersResponse,
  CreateUserResponse,
} from "./types.ts";

export class TrotecApiClient {
  public baseUrl: string;
  public jwtToken?: string;

  public client: (
    method: "POST" | "GET" | "PUT",
    path: string,
    body: object
  ) => Promise<Response>;

  constructor(private ipAddress: string) {
    this.baseUrl = "https://" + this.ipAddress + ":5001";

    this.client = async (
      method: "GET" | "POST" | "PUT",
      path: string,
      body: object
    ) => {
      const url = new URL(path, this.baseUrl);
      const res = await fetch(url.toString(), {
        method,
        body: method === "GET" ? undefined : JSON.stringify(body),
        headers: {
          "content-type": "application/json",
          // @ts-expect-error
          authorization: this.jwtToken ? `Bearer ${this.jwtToken}` : undefined,
          origin: "https://" + ipAddress + ":2402",
          referer: "https://" + ipAddress + ":2402/",
        },
      });
      // console.log(res);
      return res;
    };
  }

  public async signIn(email: string, password: string) {
    const res = await this.client("POST", "/api/User/SignIn", {
      email,
      password,
    });
    const json: SignInResponse = await res.json();
    this.jwtToken = json.token;
    return json;
  }

  public async createUser(
    newUserName: string,
    newUserEmail: string,
    newUserPassword: string
  ) {
    const res = await this.client(
      "POST",
      `/api/User/CreateUser?password=${newUserPassword}&language=JP`,
      {
        email: newUserEmail,
        name: newUserName,
        password: newUserPassword,
      }
    );
    const json: CreateUserResponse = await res.json();
    return json;
  }

  public async getUsers() {
    const res = await this.client("GET", "/api/User/GetUsers", {});
    const json: GetUsersResponse = await res.json();
    return json;
  }

  public async acceptEula() {
    const res = await this.client(
      "POST",
      `/api/User/AcceptEula?eulaVersion=1_0`,
      {}
    );
    return res;
  }

  public async updateUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const res = await this.client(
      "PUT",
      `/api/User/UpdateUserPassword?userId=${userId}&currentPassword=${currentPassword}&newPassword=${newPassword}`,
      {}
    );
    return res;
  }

  public async deleteUser(userId: string) {
    const res = await this.client(
      "PUT",
      `/api/User/DeleteUser?userId=${userId}`,
      {}
    );
    return res;
  }
}
