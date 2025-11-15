import bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import UserModel from '@/model/User.model';
import dbConnect from '@/lib/dbConnect.lib';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Email", type: "text", placeholder: "happy123@gmail.com" },
                password: { label: "password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();

                try {
                    const user = await UserModel.findOne({  // find user using email or username  
                        $or: [{ email: credentials.identifier }, { username: credentials.identifier }]
                    })

                    if (!user) {  // if user doesnot exits 
                        throw new Error("Incorrect Credentials");
                    }

                    if (!user.isVerified) { // if user is not verified
                        throw new Error("Please verify your account before login");
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordCorrect) {
                        throw new Error("Incorrect Credentials");
                    }   

                    return user;
                } catch (error: any) {
                    throw new Error(error);  // user will be redirected to error page  
                }
            }
        })
        // more providers can be added here 
    ],
    callbacks: {
        async jwt({ token, user }) {  // user is user returned by authorize function 
            if (user) {
                // adding more data to token to reduce db calls 
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                // adding more data to session.user to reduce db calls 
                session.user._id = token._id?.toString();
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
        }
    },
    pages: {
        signIn: '/sign-in',   // overwrite signin page  
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
}

