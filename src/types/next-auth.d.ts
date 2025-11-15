import { DefaultSession } from './../../node_modules/next-auth/src/core/types';
import { Session } from './../../node_modules/next-auth/core/types.d';
// this files modifies existing types/module in the codebase in next auth package 
import 'next-auth'

declare module 'next-auth' {
    interface User {  // redefining the User iterface 
        _id?: string,
        isVerified?: boolean,
        isAcceptingMessages?: boolean,
        username?: string,
    }
    interface Session {
        user: {
            _id?: string,
            isVerified?: boolean,
            isAcceptingMessages?: boolean,
            username?: string,
        } & DefaultSession['user']  // by default session will have a user key 
    }
}

declare module 'next-auth/jwt' {  // can be done this way too 
    interface JWT {
        _id?: string,
        isVerified?: boolean,
        isAcceptingMessages?: boolean,
        username?: string,
    }
}