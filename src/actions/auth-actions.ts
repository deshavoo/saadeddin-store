"use server"

import { db } from "@/lib/db"
import bcrypt from "bcrypt"

export async function registerUser(formData: {
  name: string
  email: string
  password: string
}) {
  try {
    const { name, email, password } = formData

    if (!name || !email || !password) {
      return { error: "جميع الحقول مطلوبة" }
    }

    // التحقق مما إذا كان المستخدم موجوداً بالفعل
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "البريد الإلكتروني مستخدم بالفعل" }
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء المستخدم في قاعدة البيانات
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return { success: "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول" }
  } catch (error) {
    console.error("Error registering user:", error)
    return { error: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً" }
  }
}