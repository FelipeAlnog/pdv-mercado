"use server";

import { signIn } from "@/services/auth";

export async function loginAction(formData: FormData) {
    // Depuração: verificar se os campos estão sendo enviados corretamente
    console.log("Server action received formData:", Object.fromEntries(formData.entries()));

    const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false, // Para capturar o erro no frontend
    });

    if (result?.error) {
        throw new Error(result.error); // Lança o erro para o frontend tratar
    }
}
