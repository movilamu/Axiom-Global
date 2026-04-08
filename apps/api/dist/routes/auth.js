import { Router } from "express";
import { z } from "zod";
const router = Router();
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
const signupSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8),
    locale: z.string().optional(),
    currency: z.string().optional(),
});
router.post("/signup", async (req, res) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request",
                code: "VALIDATION_ERROR",
                details: parsed.error.flatten(),
            });
        }
        return res.status(201).json({
            user: { id: `user-${Date.now()}`, email: parsed.data.email },
            message: "Account created. Check your email for OTP.",
        });
    }
    catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({
            error: "Something went wrong. Please try again.",
            code: "INTERNAL_ERROR",
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid email or password",
                code: "VALIDATION_ERROR",
                details: parsed.error.flatten(),
            });
        }
        const { email, password } = parsed.data;
        // TODO: Verify against Supabase Auth / DB, issue JWT
        // Demo: accept demo@test.com / any 8+ char password for prototype
        if (email === "demo@test.com" && password.length >= 8) {
            return res.json({
                user: { id: "demo-user-1", email },
                token: "demo-jwt-token",
            });
        }
        return res.status(401).json({
            error: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            error: "Something went wrong. Please try again.",
            code: "INTERNAL_ERROR",
        });
    }
});
export default router;
