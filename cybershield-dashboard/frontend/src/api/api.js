import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json"
  }
});

export const getState = async () => {
  const { data } = await api.get("/state");
  return data;
};

export const resetEnvironment = async () => {
  const { data } = await api.post("/reset");
  return data;
};

export const performAction = async (action) => {
  const { data } = await api.post("/step", { action });
  return data;
};

export default api;
