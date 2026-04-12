import { createAuthClient } from "better-auth/react";

import { customSessionClient } from "better-auth/client/plugins";
import { auth } from "./auth";
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL ,

})
export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;