import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  redirectTo: z.string().optional(),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export interface AuthActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[] | undefined>;
}
