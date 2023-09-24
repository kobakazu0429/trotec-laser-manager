import type {
  SignInResponse,
  GetUsersResponse,
  CreateUserResponse,
  GetDesignsResponse,
  GetJobsResponse,
} from "./types.ts";

type Client = (options: {
  method: "POST" | "GET" | "PUT" | "DELETE";
  path: string;
  body?: object;
  headers?: object;
}) => Promise<Response>;

export class TrotecApiClient {
  public baseUrl: string;
  public jwtToken?: string;

  public client: Client;

  constructor(private ipAddress: string) {
    this.baseUrl = "https://" + this.ipAddress + ":5001";

    this.client = async ({ method, path, body, headers }) => {
      const url = new URL(path, this.baseUrl);
      const res = await fetch(url.toString(), {
        method,
        body: method === "GET" ? undefined : body ? JSON.stringify(body) : null,
        headers: {
          "content-type": "application/json",
          // @ts-expect-error
          authorization: this.jwtToken ? `Bearer ${this.jwtToken}` : undefined,
          origin: "https://" + ipAddress + ":2402",
          referer: "https://" + ipAddress + ":2402/",
          ...headers,
        },
      });
      // console.log(res);
      return res;
    };
  }

  public async signIn(email: string, password: string) {
    const res = await this.client({
      method: "POST",
      path: "/api/User/SignIn",
      body: {
        email,
        password,
      },
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
    const res = await this.client({
      method: "POST",
      path: `/api/User/CreateUser?password=${newUserPassword}&language=JP`,
      body: {
        email: newUserEmail,
        name: newUserName,
        password: newUserPassword,
      },
    });
    const json: CreateUserResponse = await res.json();
    return json;
  }

  public async getUsers() {
    const res = await this.client({
      method: "GET",
      path: "/api/User/GetUsers",
    });
    const json: GetUsersResponse = await res.json();
    return json;
  }

  public async acceptEula() {
    const res = await this.client({
      method: "POST",
      path: `/api/User/AcceptEula?eulaVersion=1_0`,
    });
    return res;
  }

  public async updateUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const res = await this.client({
      method: "PUT",
      path: `/api/User/UpdateUserPassword?userId=${userId}&currentPassword=${currentPassword}&newPassword=${newPassword}`,
    });
    return res;
  }

  public async deleteUser(userId: string) {
    const res = await this.client({
      method: "PUT",
      path: `/api/User/DeleteUser?userId=${userId}`,
    });
    return res;
  }

  public async getDesigns() {
    const res = await this.client({
      method: "GET",
      path: "/api/DesignData/GetDesigns",
    });
    const json: GetDesignsResponse = await res.json();
    return json;
  }

  public async deleteDesigns(designIds: string[]) {
    const res = await this.client({
      method: "DELETE",
      path: `/api/DesignData/DeleteDesigns`,
      body: designIds,
    });
    return res;
  }

  public async getJobs() {
    const res = await this.client({
      method: "GET",
      path: "/api/Workbench/GetWorkbenches",
    });
    const json: GetJobsResponse = await res.json();
    return json;
  }

  public async deleteJobs(jobIds: string[]) {
    const res = await this.client({
      method: "DELETE",
      path: `/api/Workbench/DeleteWorkbenches`,
      body: jobIds,
    });
    return res;
  }

  public async updateUserPreferences(body: any[]) {
    const res = await this.client({
      method: "PUT",
      path: `/api/User/UpdateUserPreferences`,
      body,
    });
    return res;
  }

  public async updateUserLanguage() {
    const res = await this.updateUserPreferences([
      { key: "Language", value: "JP" },
    ]);
    return res;
  }

  public async clearQueue() {
    const res = await this.client({
      method: "POST",
      path: `/api/Queue/ClearQueue?jobQueueItemType=NonRotary`,
      headers: {
        "x-target-device": "local-only/S4-5723",
      },
    });
    console.log(res);
    return res;
  }
}
