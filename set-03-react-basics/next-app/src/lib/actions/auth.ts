"use server";

import { redirect } from "next/navigation";
import { registerUser, loginUser } from "@/lib/services/auth-service";
import {
  registerSchema,
  loginSchema,
} from "@/lib/validations/auth";

export interface AuthState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    form?: string[];
  };
  values?: {
    name?: string;
    email?: string;
  };
}

export async function registerAction(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const values = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: {
        name: typeof values.name === "string" ? values.name : "",
        email: typeof values.email === "string" ? values.email : "",
      },
    };
  }

  try {
    await registerUser(
      parsed.data.name,
      parsed.data.email,
      parsed.data.password
    );
  } catch (error) {
    const databaseError = error as { code?: string };

    if (databaseError.code === "23505") {
      return {
        errors: {
          email: ["An account with this email already exists."],
        },
        values: {
          name: parsed.data.name,
          email: parsed.data.email,
        },
      };
    }

    console.error("Registration failed:", error);

    return {
      errors: {
        form: ["Unable to create your account. Please try again."],
      },
    };
  }

  redirect("/projects");
}

export async function loginAction(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const values = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: {
        email: typeof values.email === "string" ? values.email : "",
      },
    };
  }

  try {
    const user = await loginUser(
      parsed.data.email,
      parsed.data.password
    );

    if (!user) {
      return {
        errors: {
          form: ["Invalid email or password."],
        },
        values: {
          email: parsed.data.email,
        },
      };
    }
  } catch (error) {
    console.error("Login failed:", error);

    return {
      errors: {
        form: ["Unable to log in. Please try again."],
      },
    };
  }

  redirect("/projects");
}


import { deleteSession } from "@/lib/auth";

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
