import type {
  SignInResponse,
  GetUsersResponse,
  CreateUserResponse,
  GetDesignsResponse,
  GetJobsResponse,
} from "./types.ts";

export class TrotecApiClient {
  public baseUrl: string;
  public jwtToken?: string;

  public client: (
    method: "POST" | "GET" | "PUT" | "DELETE",
    path: string,
    body: object
  ) => Promise<Response>;

  constructor(private ipAddress: string) {
    this.baseUrl = "https://" + this.ipAddress + ":5001";

    this.client = async (
      method: "GET" | "POST" | "PUT" | "DELETE",
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

  public async getDesigns() {
    const res = await this.client("GET", "/api/DesignData/GetDesigns", {});
    const json: GetDesignsResponse = await res.json();
    return json;
  }

  public async deleteDesigns(designIds: string[]) {
    const res = await this.client(
      "DELETE",
      `/api/DesignData/DeleteDesigns`,
      designIds
    );
    return res;
  }

  public async getJobs() {
    const res = await this.client("GET", "/api/Workbench/GetWorkbenches", {});
    const json: GetJobsResponse = await res.json();
    return json;
  }

  public async deleteJobs(jobIds: string[]) {
    const res = await this.client(
      "DELETE",
      `/api/Workbench/DeleteWorkbenches`,
      jobIds
    );
    return res;
  }

  public async updateUserPreferences(body: any[]) {
    const res = await this.client(
      "PUT",
      `/api/User/UpdateUserPreferences`,
      body
    );
    return res;
  }

  public async updateUserLanguage() {
    const res = await this.updateUserPreferences([
      { key: "Language", value: "JP" },
    ]);
    return res;
  }
}
