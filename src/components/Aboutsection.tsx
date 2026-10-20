import Image, { type StaticImageData } from "next/image";


type AboutImage = {
    src: string | StaticImageData;
    alt: string;
    width?: number;
    height?: number;
};

type AboutSectionProps = {
    className?: string;
    largeImage?: AboutImage;
    smallImage?: AboutImage;
};

const DEFAULT_LARGE_IMAGE: AboutImage = {
    src: "/images/about/heritage-large.jpg",
    alt: "صينية بقلاوة وكنافة من حلويات سعد الدين مقدّمة بحرفية تقليدية",
    width: 1000,
    height: 1250,
};

const DEFAULT_SMALL_IMAGE: AboutImage = {
    src: "/images/about/heritage-small.jpg",
    alt: "حلواة شرقية بالعسل والمكسرات من صناعة سعد الدين",
    width: 600,
    height: 750,
};

const HEADING_ID = "about-heading";

const STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "حلويات سعد الدين",
    alternateName: "Saad Eddin Sweets",
    foundingDate: "1919",
    description:
        "حلويات شرقية أصيلة منذ عام 1919: بقلاوة وكنافة ومعمول وكعك احتفالات ومعجنات وشوكولاتة حسب الطلب.",
};

const BODY_TEXT = "text-base leading-8 text-[#fef8eb]/80 sm:text-[17px] sm:leading-9";
const SUBHEADING = "text-xl font-semibold leading-snug text-[#c5a880] sm:text-2xl";

export default function AboutSection({
    className = "",
    largeImage = DEFAULT_LARGE_IMAGE,
    smallImage = DEFAULT_SMALL_IMAGE,
}: AboutSectionProps) {
    return (
        <section
            id="about"
            dir="rtl"
            lang="ar"
            aria-labelledby={HEADING_ID}
            className={`relative scroll-mt-20 overflow-x-clip bg-[#005430] bg-[radial-gradient(70rem_36rem_at_100%_0%,rgba(197,168,128,0.12),transparent_65%)] py-20 text-[#fef8eb] sm:py-28 lg:py-32 ${className}`}
        >
            <script
                type="application/ld+json"
                // escape "<" لمنع إغلاق الـ script بالغلط
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c"),
                }}
            />

            <div className="mx-auto grid max-w-7xl gap-x-16 gap-y-12 px-6 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-x-20 lg:px-10 xl:gap-x-28">
                {/* العنوان + المقدمة */}
                <header className="lg:col-start-1 lg:row-start-1">
                    <h2
                        id={HEADING_ID}
                        className="text-[1.875rem] font-light leading-[1.55] sm:text-5xl sm:leading-[1.4]"
                    >
                        سعد الدين، إرثٌ من الحلوى يمتد منذ عام 1919
                    </h2>

                    <div
                        aria-hidden="true"
                        className="mt-7 h-px w-24 bg-[linear-gradient(to_left,#c5a880,transparent)] sm:mt-9 sm:w-32"
                    />

                    <p className="mt-7 max-w-[60ch] text-[1.0625rem] leading-9 text-[#fef8eb] sm:mt-9 sm:text-xl sm:leading-10">
                        عند استكشاف تاريخ الحلويات الشرقية العريق، قليل من الأسماء التي تحظى بمثل هذا
                        الاحترام الدائم والحنين إلى الماضي مثل حلويات سعد الدين. وفي الوقت الذي تسلط فيه
                        البصمات التجارية الحديثة الضوء غالباً على عصور التوسع المؤسسي، فإن البداية الحقيقية
                        لتقاليد سعد الدين الطهوية تعود طوال الطريق إلى عام 1919، مما رسخ إرثاً يمتد لقرن
                        من الزمان مكرساً للحرفية المتقنة في صناعة الحلويات الإقليمية الأصيلة.
                    </p>
                </header>

                {/* الصور: على الموبايل بين المقدمة والتفاصيل، وعلى الديسكتوب ثابتة (sticky) بجانب النص */}
                <figure className="relative mx-auto w-full max-w-md pb-24 sm:max-w-lg sm:pb-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none lg:self-start lg:sticky lg:top-28">
                    {/* الصورة الكبيرة */}
                    <div className="relative me-auto w-[84%]">
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-e-3 -top-3 h-full w-full rounded-2xl border border-[#c5a880]/45 sm:-inset-e-4 sm:-top-4"
                        />
                        <Image
                            src={largeImage.src}
                            alt={largeImage.alt}
                            width={largeImage.width}
                            height={largeImage.height}
                            sizes="(min-width: 1024px) 34vw, (min-width: 640px) 60vw, 84vw"
                            quality={90}
                            className="relative h-auto w-full rounded-2xl shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)]"
                        />
                    </div>

                    {/* الصورة الصغيرة: تتداخل مع زاوية الكبيرة */}
                    <div className="absolute bottom-0 inset-s-0 w-[44%] overflow-hidden rounded-xl border-[5px] border-[#005430] bg-[#005430] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)] sm:border-8">
                        <Image
                            src={smallImage.src}
                            alt={smallImage.alt}
                            width={smallImage.width}
                            height={smallImage.height}
                            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 36vw"
                            quality={90}
                            className="block h-auto w-full"
                        />
                    </div>

                    {/* سنة التأسيس: نص فقط بدون أي أيقونة */}
                    <figcaption className="absolute bottom-0 inset-e-0 text-end">
                        <span
                            dir="ltr"
                            className="block text-5xl font-light leading-none tracking-tight text-[#c5a880] sm:text-6xl"
                        >
                            1919
                        </span>
                        <span className="mt-3 block text-sm text-[#fef8eb]/70 sm:text-base">
                            عام البداية
                        </span>
                    </figcaption>
                </figure>

                {/* التفاصيل */}
                <div className="space-y-10 sm:space-y-12 lg:col-start-1 lg:row-start-2">
                    <article className="border-t border-[#c5a880]/25 pt-8 sm:pt-10">
                        <h3 className={SUBHEADING}>جذور متأصلة في التراث</h3>
                        <p className={`mt-4 max-w-[62ch] ${BODY_TEXT}`}>
                            قبل أن تصبح العلامة التجارية اسمًا مألوفًا في كل بيت لديه شبكة تجارية حديثة
                            ومنتشرة، بُني أساس سعد الدين على تقاليد حرفية خالدة تناقلتها الأجيال. ومن خلال
                            نشأتها من تفاني عميق بفنون صناعة الحلويات الكلاسيكية، وضع المؤسسون الأوائل
                            معياراً يركز على المكونات النقية—مثل السمن الحيواني الفاخر، والعسل الطبيعي،
                            والمكسرات المختارة—والتي حددت ملامح صناعة المعجنات التقليدية في جميع أنحاء
                            المنطقة.
                        </p>
                    </article>

                    <article className="border-t border-[#c5a880]/25 pt-8 sm:pt-10">
                        <h3 className={SUBHEADING}>جسر يربط بين أجيال من فنون الحلويات</h3>
                        <p className={`mt-4 max-w-[62ch] ${BODY_TEXT}`}>
                            ما بدأ قبل قرن من الزمان تقريبا كالتزام بالحرفية تطور بشكل عضوي عبر عقود من
                            التفاني العائلي. لقد اعتمدت الروح الأساسية للعلامة التجارية دائماً على إتقان
                            التوازنات الدقيقة بين القوام والنكهات الموجودة في الأصناف التراثية:
                        </p>

                        <ul role="list" className="mt-7 max-w-[62ch] space-y-7">
                            <li className="border-s border-[#c5a880]/60 ps-5 sm:ps-6">
                                <p className={BODY_TEXT}>
                                    <strong className="font-semibold text-[#fef8eb]">إتقان الكلاسيكيات:</strong>{" "}
                                    من البقلاوة المتباينة الطبقات والمشبعة بالعسل، إلى الكنافة الطازجة
                                    والمعمول المصنوع بعناية، حافظت العلامة التجارية على وصفات كان من الممكن
                                    أن تضيع لولا ذلك وسط الاختصارات الصناعية.
                                </p>
                            </li>
                            <li className="border-s border-[#c5a880]/60 ps-5 sm:ps-6">
                                <p className={BODY_TEXT}>
                                    <strong className="font-semibold text-[#fef8eb]">تطور الحرفة:</strong>{" "}
                                    مع مرور الأحقاب والعقود، دمجت المطابخ بسلاسة مؤثرات طهوية جديدة—مقدمةً
                                    كعكات الاحتفالات الغنية، والمعجنات على الطريقة الأوروبية، وتشكيلات
                                    الشوكولاتة المصممة حسب الطلب—دون أن تفقد أبداً البصر عن أساس عام 1919 الذي
                                    بدأت به كل القصة.
                                </p>
                            </li>
                        </ul>
                    </article>

                    <article className="border-t border-[#c5a880]/25 pt-8 sm:pt-10">
                        <h3 className={SUBHEADING}>الحفاظ على مؤسسة طهوية</h3>
                        <p className={`mt-4 max-w-[62ch] ${BODY_TEXT}`}>
                            اليوم، عندما يفتح العملاء علبة تحمل توقيع سعد الدين، فإنهم لا يتفاعلون فقط مع
                            واجهة متجر حديثة؛ بل يشاركون في سلسلة مستمرة من النكهات يمتد عمرها لقرن من
                            الزمان. ومن خلال تكريم الحرفية التي انطلقت في عام 1919 مع التكيف بأناقة مع
                            الأذواق المعاصرة وسهولة الوصول الرقمي، تظل حلويات سعد الدين معلماً حياً يخلد
                            التراث الطهوي في الشرق الأوسط.
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}