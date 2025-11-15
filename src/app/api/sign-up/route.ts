import dbConnect from "@/lib/dbConnect.lib";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail.helper";
import { success } from "zod";
import { ApiResponse } from "@/types/ApiResponse.types";
import { tr } from "zod/locales";


export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();  // await is required while taking data from request object 
        const existingUserVerifiedByUsername = await UserModel.findOne({ username, isVerified: true }); // check if is a verified user is using the requested username 

        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                }, { status: 400 }
            )
        }

        const existingUserByEmail = await UserModel.findOne({ email });

        const verifyCode = Math.floor(100000 + Math.random() * 900000); // generate otp 

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {  // existing user by email is verified 
                return Response.json(
                    {
                        success: false,
                        message: "User exits with this email."
                    }, { status: 400 }
                )
            }

            // existing user by email is not verified -> check password -> send verification email  

            const isPasswordCorrect = await bcrypt.compare(password, existingUserByEmail.password);
            if (!isPasswordCorrect) {
                return Response.json(
                    {
                        success: false,
                        message: "Incorrect Credentials."
                    }, { status: 400 }
                )
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode.toString();
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

            await existingUserByEmail.save();

        } else {
            const hashedPassword = await bcrypt.hash(password, 10);

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
            })

            await newUser.save();
        }

        // send verification email 
        const emailResponse = await sendVerificationEmail(email, username, verifyCode.toString());

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message,
            }, { status: 500 })
        }

        return Response.json({
            success: true,
            message: "User Registered Successfully. Please verify your email.",
        }, { status: 201 })


    } catch (error) {
        console.error("Error Registering User", error);
        return Response.json(
            {
                success: false,
                message: "Error registering user",
            },
            {
                status: 500
            }
        )
    }
}