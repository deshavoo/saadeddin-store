"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { name: string; phone: string }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { error: "غير مرخص، يرجى تسجيل الدخول" }
    }

    await db.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
      },
    })

    revalidatePath("/profile")
    return { success: "تم تحديث البيانات الشخصية بنجاح" }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "حدث خطأ أثناء تحديث البيانات" }
  }
}

export async function updatePassword(data: { currentPassword: string; newPassword: string }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { error: "غير مرخص، يرجى تسجيل الدخول" }
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || !user.password) {
      return { error: "المستخدم غير موجود" }
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.password)
    if (!isValid) {
      return { error: "كلمة المرور الحالية غير صحيحة" }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    await db.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    })

    return { success: "تم تغيير كلمة المرور بنجاح" }
  } catch (error) {
    console.error("Error updating password:", error)
    return { error: "حدث خطأ أثناء تغيير كلمة المرور" }
  }
}