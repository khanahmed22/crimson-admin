// paddle.js
import { initializePaddle } from "@paddle/paddle-js";

let paddleInstance = null;

export async function initPaddle() {
  if (paddleInstance) return paddleInstance;

  paddleInstance = await initializePaddle({
    token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
  });

  return paddleInstance;
}
