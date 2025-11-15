import NextAuth from "next-auth";
import { authOptions } from "./options";

const handler = NextAuth(authOptions);  // name has to be handler 

export { handler as GET, handler as POST };