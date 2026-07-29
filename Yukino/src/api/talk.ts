import apiClient from "../utils/request";

export interface TalkMessage {
  id?: number | string;
  username: string;
  text: string;
  time?: number;
}

export interface CaptchaData {
  captchaId: string;
  svg: string;
}

export async function fetchTalks(): Promise<TalkMessage[]> {
  return apiClient.get(`/api/talk`);
}

export async function fetchCaptcha(): Promise<CaptchaData> {
  return apiClient.get(`/api/talk/captcha`);
}

export async function postTalk(payload: {
  username: string;
  text: string;
  captchaId: string;
  captcha: string;
}): Promise<TalkMessage> {
  return apiClient.post(`/api/talk`, payload);
}
