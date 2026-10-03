import axiosSecure from "../utils/axiosSecure";

export const createThread = async (threadData: { content: string; author?: string }) => {
  const response = await axiosSecure.post("/api/threads", threadData);
  return response.data;
};

export const createComment = async (threadId: string, commentData: { content: string; author?: string; parent?: string }) => {
  const response = await axiosSecure.post(`/api/threads/${threadId}`, commentData);
  return response.data;
};