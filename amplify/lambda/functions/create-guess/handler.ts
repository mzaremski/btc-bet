import { createResponse } from "../../utils/create_response";

export const handler = async (event) => {
  console.log('[create-guess] ENTIRE EVENT:', event);
  return createResponse(200, JSON.stringify({ message: "Hello, world!" }));
};
