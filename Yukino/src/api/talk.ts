import apiClient from "../utils/request";

export interface TalkMessage {
  id?: number | string;
  username: string;
  text: string;
  time?: number;
}

export async function fetchTalks(): Promise<TalkMessage[]> {
  return apiClient.get(`/api/talk`);
}

export async function postTalk(payload: TalkMessage): Promise<TalkMessage> {
  return apiClient.post(`/api/talk`, payload);
}
