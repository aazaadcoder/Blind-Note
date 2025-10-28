import {z} from 'zod';


export const signInSchema = z.object({
    indetifier : z.string(),  // username or email
    password : z.string(),
})