import axios, {Axios, AxiosHeaders} from 'axios';
import {v1 as uuidv1} from 'uuid';

const nudgeUrl = 'https://pointsystem.api.nudgenow.com/api/v1';

export interface UserData {
  _id: string;
  deviceId: string;
  name: string;
  email: string;
  phoneNumber: string;
  referredBy: string;
  referrerCode: string;
  usersReferred: number;
  referralCode: string;
  referralCodeExpiry: string;
  externalId: string;
  score: number;
  clientId: string;
  shareId: string;
  token: string;
  tags: any[];
  tasks: any[];
  rewards: any[];
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  v: number;
}

export interface User {
  status?: string;
  data?: UserData;
}

export interface EventProps {
  [key: string]: any;
}

export interface NudgeOptions {
  apiKey: string;
}

export class Nudge {
  private apiKey: string;
  // public endUserApi: Axios;
  public endUserApi: Axios;
  public clientApi: Axios;
  private session: string;
  public userToken: string | null = null;
  private userData: UserData | null = null;

  constructor({apiKey}: NudgeOptions) {
    if (apiKey.length === 0) {
      throw new Error('Nudge API key is required');
    }

    this.apiKey = apiKey;
    this.session = this.uuid();
    this.endUserApi = this.endUserApiCall();
    this.clientApi = this.clientApiCall();
  }

  clientApiCall() {
    const clientApi = axios;
    clientApi.interceptors.request.clear();
    clientApi.interceptors.request.use(request => {
      request.headers = AxiosHeaders.concat(request.headers, {
        Authorization: `${this.apiKey}`,
      });
      return request;
    });
    return clientApi;
  }

  endUserApiCall() {
    const endUserApi = axios;
    endUserApi.interceptors.request.clear();
    endUserApi.interceptors.request.use(request => {
      const token = this.getUserToken();
      request.headers = AxiosHeaders.concat(request.headers, {
        Authorization: `${token}`,
      });
      return request;
    });
    return endUserApi;
  }

  private uuid(): string {
    return uuidv1();
  }

  private getUserToken(): string | null {
    return this.userToken;
  }

  async initSession({
    externalId,
    properties,
  }: {
    externalId: string;
    properties?: EventProps;
  }): Promise<string | null> {
    const url = `${nudgeUrl}/users/u/create`;
    console.log(this.apiKey);
    const data = {
      externalId,
      ...properties,
    };
    try {
      const response = await this.clientApiCall().post(url, data);
      const user: User = response.data;
      this.userToken = user?.data?.token || null;
      this.userData = user?.data || null;

      // this.endUserApiCall(this.userToken);
      return this.userToken;
    } catch (error) {
      throw new Error('Error initializing session: ' + error);
    }
  }

  async track({
    type,
    properties,
  }: {
    type: string;
    properties?: EventProps;
  }): Promise<any> {
    if (!this.userToken) {
      throw new Error(
        'User token not available. Please call initSession first.',
      );
    }

    const url = `${nudgeUrl}/events/e/track`;

    const data = {
      type,
      sessionId: this.session,
      ...properties,
    };

    try {
      const response = await this.endUserApiCall().post(url, data);
      const responseData = response.data;

      if (typeof this.trackcall === 'function') {
        this.trackcall(responseData?.data);
      }

      return responseData?.data;
    } catch (error) {
      throw new Error('Error tracking event: ' + error);
    }
  }

  async getRewardsData(): Promise<any> {
    if (!this.userToken) {
      throw new Error(
        'User token not available. Please call initSession first.',
      );
    }

    const url = `${nudgeUrl}/users/u/get/${this.userData?._id}`;

    try {
      const response = await this.endUserApiCall().get(url);
      const responseData = response.data;

      return responseData?.data;
    } catch (error) {
      throw new Error('Error getting rewards data: ' + error);
    }
  }

  async availableRewards({
    type = null,
  }: {type?: string | null} = {}): Promise<any> {
    let url;

    if (type) {
      url = `${nudgeUrl}/rewards/r/get/available?type=${type}`;
    } else {
      url = `${nudgeUrl}/rewards/r/get/available`;
    }

    if (!this.userToken) {
      throw new Error(
        'User token not available. Please call initSession first.',
      );
    }
    try {
      const response = await this.endUserApiCall().get(url);
      const responseData = response.data;

      return responseData?.data;
    } catch (error) {
      throw new Error('Error getting available rewards: ' + error);
    }
  }

  private trackcall?: (data: any) => void;

  getCallBack(callBack: (data: any) => void): void {
    this.trackcall = callBack;
  }
}
