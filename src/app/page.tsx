import FeaturesBar from "@/components/FeaturesBar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import OccasionsSection from "@/components/Occasionssection";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import AboutSection from "@/components/Aboutsection";
import OccasionPickerSection from "@/components/Occasionpickersection";
import CorporateGiftsSection from "@/components/Corporategiftssection";
import CustomCakeSection from "@/components/Customcakesection";

export default async function Home() {
  const session = await auth();

  // 1. جلب المنتجات الفعالة من قاعدة البيانات
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  // 2. جلب قائمة المفضلة الخاصة بالمستخدم الحالي (إن وجد تسجيل دخول)
  let initialWishlist: string[] = [];
  if (session?.user?.email) {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { wishlist: true },
    });
    if (user?.wishlist) {
      initialWishlist = user.wishlist.map((w) => w.productId);
    }
  }

  return (
    <>
      <HeroSection />
      <FeaturesBar />
      <ProductsSection products={products} initialWishlist={initialWishlist} />
      <OccasionsSection />
      <OccasionPickerSection />
      <CorporateGiftsSection />
      <CustomCakeSection />
      <AboutSection />

    </>
  );
}