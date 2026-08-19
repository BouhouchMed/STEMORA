"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Gamepad2,
  HelpCircle,
  Lightbulb,
  LockKeyhole,
  Mail,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Wrench
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Controller, FieldErrors, useForm, UseFormReturn } from "react-hook-form";
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  calculateAge,
  createRegistrationSchema,
  type RegistrationFormValues,
  type RegistrationLocale
} from "@/lib/registration-schema";
import { cn } from "@/lib/utils";

type Locale = RegistrationLocale;
type Option = {
  value: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const localeLabels: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
  darija: "الدارجة"
};

const copy = {
  fr: {
    dir: "ltr",
    badge: "Inscriptions ouvertes",
    heroTitle: "Inscrivez votre enfant à STEMORA",
    heroText:
      "Programmation, robotique, intelligence artificielle et technologies créatives à travers des cours interactifs et des projets concrets.",
    help: "Besoin d'aide ?",
    whatsapp: "WhatsApp",
    trusts: ["Cours en direct", "Petits groupes", "Apprentissage par projets"],
    stepCounter: (current: number, total: number) => `Étape ${current} sur ${total}`,
    steps: ["Enfant", "Programme", "Parent", "Disponibilités", "Confirmation"],
    childTitle: "Parlez-nous de votre enfant",
    childSubtitle: "Ces informations nous permettront de lui proposer le parcours le plus adapté.",
    childName: "Prénom et nom de l'enfant",
    birthDate: "Date de naissance",
    years: "ans",
    schoolLevel: "Niveau scolaire",
    select: "Sélectionner",
    schoolLevels: ["Primaire", "Collège", "Lycée", "Autre"],
    cityCountry: "Ville / Pays",
    cityPlaceholder: "Casablanca, Maroc",
    experienceLabel: "Niveau actuel en programmation",
    programTitle: "Qu'aimerait-il apprendre ?",
    programSubtitle:
      "Sélectionnez un ou plusieurs domaines. Nous vous aiderons ensuite à choisir le meilleur parcours.",
    notSureTitle: "🤔 Je ne sais pas encore",
    notSureDescription: "L'équipe STEMORA m'aidera à choisir le programme adapté.",
    parentTitle: "Comment pouvons-nous vous contacter ?",
    parentName: "Nom complet du parent",
    phone: "Téléphone / WhatsApp",
    email: "Adresse e-mail",
    preferredContact: "Moyen de contact préféré",
    privacyNote: "Vos coordonnées sont utilisées uniquement pour traiter votre demande d'inscription.",
    availabilityTitle: "Quand votre enfant est-il disponible ?",
    preferredDays: "Jours préférés",
    preferredPeriod: "Période préférée",
    scheduleNote:
      "L'horaire définitif sera confirmé avec vous en fonction du niveau de l'enfant et des groupes disponibles.",
    courseType: "Type de cours",
    confirmationTitle: "Vérifiez votre demande",
    groups: {
      child: "Enfant",
      level: "Niveau",
      programs: "Programme(s)",
      parent: "Parent",
      contact: "Contact",
      availability: "Disponibilités",
      course: "Type de cours"
    },
    edit: "Modifier",
    consent: "J'accepte que STEMORA me contacte concernant cette demande d'inscription.",
    marketing: "Je souhaite recevoir les nouveautés, ateliers et activités STEMORA.",
    protected: "Vos informations sont protégées et ne seront pas partagées avec des tiers.",
    back: "Retour",
    next: "Continuer",
    submit: "Envoyer ma demande d'inscription",
    submitting: "Envoi en cours...",
    submitError: "Une erreur est survenue. Veuillez réessayer.",
    captchaRequired: "Veuillez valider le Captcha avant l'envoi.",
    captchaError: "Captcha invalide. Veuillez réessayer.",
    successTitle: "🎉 Demande reçue !",
    successText:
      "Merci pour votre confiance. L'équipe STEMORA examinera votre demande et vous contactera pour vous proposer le programme, le niveau et les horaires les plus adaptés à votre enfant.",
    nextStep: "Prochaine étape",
    successSteps: [
      "Nous examinons le profil de votre enfant.",
      "Nous vous contactons.",
      "Nous définissons le programme et le groupe adaptés.",
      "Votre enfant commence son aventure STEM !"
    ],
    whatsappCta: "Contacter STEMORA sur WhatsApp",
    home: "Retour à l'accueil"
  },
  ar: {
    dir: "rtl",
    badge: "التسجيل مفتوح",
    heroTitle: "سجّل طفلك في STEMORA",
    heroText:
      "برمجة، روبوتيك، ذكاء اصطناعي وتقنيات إبداعية من خلال حصص تفاعلية ومشاريع تطبيقية.",
    help: "هل تحتاج إلى مساعدة؟",
    whatsapp: "واتساب",
    trusts: ["حصص مباشرة", "مجموعات صغيرة", "تعلم بالمشاريع"],
    stepCounter: (current: number, total: number) => `الخطوة ${current} من ${total}`,
    steps: ["الطفل", "البرنامج", "الولي", "الأوقات", "التأكيد"],
    childTitle: "حدثنا عن طفلك",
    childSubtitle: "تساعدنا هذه المعلومات على اقتراح المسار الأنسب لمستواه واهتماماته.",
    childName: "الاسم الكامل للطفل",
    birthDate: "تاريخ الميلاد",
    years: "سنة",
    schoolLevel: "المستوى الدراسي",
    select: "اختر",
    schoolLevels: ["ابتدائي", "إعدادي", "ثانوي", "آخر"],
    cityCountry: "المدينة / البلد",
    cityPlaceholder: "الدار البيضاء، المغرب",
    experienceLabel: "المستوى الحالي في البرمجة",
    programTitle: "ماذا يرغب أن يتعلم؟",
    programSubtitle: "اختر مجالاً واحداً أو أكثر، وسنساعدك بعدها على اختيار أفضل مسار.",
    notSureTitle: "🤔 لا أعرف بعد",
    notSureDescription: "سيساعدني فريق STEMORA على اختيار البرنامج المناسب.",
    parentTitle: "كيف يمكننا التواصل معك؟",
    parentName: "الاسم الكامل للولي",
    phone: "الهاتف / واتساب",
    email: "البريد الإلكتروني",
    preferredContact: "وسيلة التواصل المفضلة",
    privacyNote: "تُستخدم معلومات التواصل فقط لمعالجة طلب التسجيل.",
    availabilityTitle: "متى يكون طفلك متاحاً؟",
    preferredDays: "الأيام المفضلة",
    preferredPeriod: "الفترة المفضلة",
    scheduleNote: "سيتم تأكيد التوقيت النهائي معك حسب مستوى الطفل والمجموعات المتوفرة.",
    courseType: "نوع الحصة",
    confirmationTitle: "راجع طلب التسجيل",
    groups: {
      child: "الطفل",
      level: "المستوى",
      programs: "البرنامج / البرامج",
      parent: "الولي",
      contact: "التواصل",
      availability: "الأوقات المتاحة",
      course: "نوع الحصة"
    },
    edit: "تعديل",
    consent: "أوافق على أن تتواصل STEMORA معي بخصوص طلب التسجيل هذا.",
    marketing: "أرغب في تلقي أخبار وورشات وأنشطة STEMORA.",
    protected: "معلوماتك محمية ولن تتم مشاركتها مع أي طرف ثالث.",
    back: "رجوع",
    next: "التالي",
    submit: "إرسال طلب التسجيل",
    submitting: "جاري الإرسال...",
    submitError: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    captchaRequired: "يرجى تأكيد الكابتشا قبل الإرسال.",
    captchaError: "الكابتشا غير صحيحة. يرجى المحاولة من جديد.",
    successTitle: "🎉 تم استلام الطلب!",
    successText:
      "شكراً على ثقتك. سيقوم فريق STEMORA بمراجعة الطلب والتواصل معك لاقتراح البرنامج والمستوى والتوقيت الأنسب لطفلك.",
    nextStep: "الخطوة التالية",
    successSteps: [
      "نراجع ملف طفلك.",
      "نتواصل معك.",
      "نحدد البرنامج والمجموعة المناسبة.",
      "يبدأ طفلك مغامرته مع STEM!"
    ],
    whatsappCta: "تواصل مع STEMORA على واتساب",
    home: "الرجوع للرئيسية"
  },
  darija: {
    dir: "rtl",
    badge: "التسجيل محلول دابا",
    heroTitle: "سجّل ولدك أو بنتك فـ STEMORA",
    heroText: "برمجة، روبوتيك، ذكاء اصطناعي وتكنولوجيا إبداعية بحصص تفاعلية ومشاريع حقيقية.",
    help: "محتاج مساعدة؟",
    whatsapp: "واتساب",
    trusts: ["حصص لايف", "گروبات صغار", "تعلم بالمشاريع"],
    stepCounter: (current: number, total: number) => `الخطوة ${current} من ${total}`,
    steps: ["الطفل", "البرنامج", "الولي", "الأوقات", "التأكيد"],
    childTitle: "عرفنا أكثر على طفلك",
    childSubtitle: "هاد المعلومات كتعاوننا نقترحو عليه parcours مناسب لمستواه وشنو كيعجبو.",
    childName: "الاسم الكامل ديال الطفل",
    birthDate: "تاريخ الازدياد",
    years: "سنة",
    schoolLevel: "المستوى الدراسي",
    select: "اختار",
    schoolLevels: ["ابتدائي", "إعدادي", "ثانوي", "آخر"],
    cityCountry: "المدينة / البلد",
    cityPlaceholder: "الدار البيضاء، المغرب",
    experienceLabel: "المستوى ديالو فالبرمجة",
    programTitle: "شنو باغي يتعلم؟",
    programSubtitle: "اختار مجال واحد أو أكثر، ومن بعد نعاونوك تختار المسار المناسب.",
    notSureTitle: "🤔 مازال ما عارفش",
    notSureDescription: "فريق STEMORA يعاونني نختار البرنامج اللي مناسب.",
    parentTitle: "كيفاش نقدروا نتواصلو معاك؟",
    parentName: "الاسم الكامل ديال الولي",
    phone: "الهاتف / واتساب",
    email: "الإيميل",
    preferredContact: "طريقة التواصل المفضلة",
    privacyNote: "معلومات التواصل ديالك كنستعملوها غير باش نعالجو طلب التسجيل.",
    availabilityTitle: "إمتى كيكون الطفل متوفر؟",
    preferredDays: "الأيام المفضلة",
    preferredPeriod: "الفترة المفضلة",
    scheduleNote: "التوقيت النهائي غادي نأكدوه معاك حسب مستوى الطفل والمجموعات المتوفرة.",
    courseType: "نوع الحصة",
    confirmationTitle: "راجع طلب التسجيل",
    groups: {
      child: "الطفل",
      level: "المستوى",
      programs: "البرنامج / البرامج",
      parent: "الولي",
      contact: "التواصل",
      availability: "الأوقات",
      course: "نوع الحصة"
    },
    edit: "تعديل",
    consent: "كنوافق أن STEMORA تتواصل معايا بخصوص طلب التسجيل هذا.",
    marketing: "بغيت نتوصل بالجديد، الورشات والأنشطة ديال STEMORA.",
    protected: "المعلومات ديالك محمية وما غاديش نتقاسموها مع أي طرف ثالث.",
    back: "رجوع",
    next: "التالي",
    submit: "إرسال طلب التسجيل",
    submitting: "جاري الإرسال...",
    submitError: "وقع خطأ. عاود حاول من فضلك.",
    captchaRequired: "أكد الكابتشا قبل ما ترسل.",
    captchaError: "الكابتشا ما خدمتهاش. عاود حاول من فضلك.",
    successTitle: "🎉 وصلنا طلبك!",
    successText:
      "شكراً على الثقة ديالك. فريق STEMORA غادي يراجع الطلب ويتواصل معاك باش يقترح البرنامج والتوقيت الأنسب لطفلك.",
    nextStep: "الخطوة الجاية",
    successSteps: [
      "كنراجعو بروفايل الطفل.",
      "كنواصلو معاك.",
      "كنحددو البرنامج والمجموعة المناسبة.",
      "طفلك كيبدا مغامرتو مع STEM!"
    ],
    whatsappCta: "تواصل مع STEMORA على واتساب",
    home: "الرجوع للرئيسية"
  }
} as const;

const defaultValues: RegistrationFormValues = {
  childName: "",
  childBirthDate: "",
  schoolLevel: "",
  cityCountry: "",
  experienceLevel: "",
  selectedPrograms: [],
  parentName: "",
  parentPhone: "+212 ",
  parentEmail: "",
  preferredContact: "",
  preferredDays: [],
  preferredPeriod: "",
  courseType: "",
  contactConsent: false as true,
  marketingConsent: false
};

const fieldsByStep: Record<number, (keyof RegistrationFormValues)[]> = {
  0: ["childName", "childBirthDate", "schoolLevel", "cityCountry", "experienceLevel"],
  1: ["selectedPrograms"],
  2: ["parentName", "parentPhone", "parentEmail", "preferredContact"],
  3: ["preferredDays", "preferredPeriod", "courseType"],
  4: ["contactConsent"]
};

const daysByLocale: Record<Locale, string[]> = {
  fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  ar: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
  darija: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
};

type T = (typeof copy)[Locale];
type WizardForm = UseFormReturn<RegistrationFormValues>;

function options(locale: Locale) {
  const isFr = locale === "fr";
  const isAr = locale === "ar";

  const experienceOptions: Option[] = [
    {
      value: "beginner",
      title: isFr ? "Débutant" : "مبتدئ",
      description: isFr
        ? "Aucune expérience nécessaire"
        : isAr
          ? "لا يحتاج إلى أي تجربة سابقة"
          : "ما خاصوش يكون عندو تجربة من قبل",
      icon: Lightbulb
    },
    {
      value: "some-basics",
      title: isFr ? "Quelques notions" : isAr ? "بعض الأساسيات" : "عندو شوية معرفة",
      description: isFr
        ? "A déjà découvert la programmation"
        : isAr
          ? "سبق له أن تعرف على البرمجة"
          : "سبق ليه تعرف على البرمجة شوية",
      icon: Code2
    },
    {
      value: "intermediate",
      title: isFr ? "Intermédiaire" : "متوسط",
      description: isFr
        ? "A déjà réalisé quelques projets"
        : isAr
          ? "أنجز بعض المشاريع من قبل"
          : "دار من قبل بعض المشاريع الصغيرة",
      icon: Cpu
    },
    {
      value: "advanced",
      title: isFr ? "Avancé" : "متقدم",
      description: isFr
        ? "Programme déjà de manière autonome"
        : isAr
          ? "يبرمج بشكل مستقل"
          : "كيبرمج بوحدو ومرتاح مع الكود",
      icon: Rocket
    }
  ];

  const programs: Option[] = [
    {
      value: "programming",
      title: isFr ? "Programmation" : "البرمجة",
      description: isFr ? "Python, logique et algorithmique." : "Python، المنطق والخوارزميات.",
      icon: Code2
    },
    {
      value: "scratch-games",
      title: isFr ? "Scratch & création de jeux" : "Scratch وصناعة الألعاب",
      description: isFr
        ? "Création interactive et initiation au code."
        : isAr
          ? "إبداع تفاعلي ومدخل إلى البرمجة."
          : "إبداع تفاعلي ومدخل ممتع للكود.",
      icon: Gamepad2
    },
    {
      value: "robotics",
      title: isFr ? "Robotique" : "الروبوتيك",
      description: isFr
        ? "Construire et programmer des robots."
        : isAr
          ? "بناء وبرمجة الروبوتات."
          : "نبنيو ونبرمجو روبوتات.",
      icon: Bot
    },
    {
      value: "arduino-esp32",
      title: isFr ? "Arduino & ESP32" : "Arduino و ESP32",
      description: isFr ? "Électronique et objets connectés." : "الإلكترونيك والأشياء المتصلة.",
      icon: Cpu
    },
    {
      value: "ai",
      title: isFr ? "Intelligence artificielle" : "الذكاء الاصطناعي",
      description: isFr
        ? "Découvrir et utiliser l'IA de manière créative."
        : isAr
          ? "اكتشاف واستعمال الذكاء الاصطناعي بطريقة إبداعية."
          : "نكتاشفو ونستعملو AI بطريقة إبداعية.",
      icon: Sparkles
    },
    {
      value: "web",
      title: isFr ? "Création de sites web" : "إنشاء المواقع",
      description: "HTML, CSS, JavaScript.",
      icon: MonitorSmartphone
    },
    {
      value: "3d",
      title: isFr ? "Design & impression 3D" : "التصميم والطباعة 3D",
      description: isFr ? "Conception 3D et fabrication numérique." : "تصميم ثلاثي الأبعاد وصناعة رقمية.",
      icon: Wrench
    }
  ];

  const contacts: Option[] = [
    { value: "whatsapp", title: isFr ? "WhatsApp" : "واتساب", description: "", icon: MessageCircle },
    { value: "phone", title: isFr ? "Téléphone" : "الهاتف", description: "", icon: Phone },
    { value: "email", title: isFr ? "E-mail" : isAr ? "البريد الإلكتروني" : "الإيميل", description: "", icon: Mail }
  ];

  const periods: Option[] = [
    { value: "morning", title: isFr ? "Matin" : "الصباح", description: "09:00 - 12:00", icon: CalendarDays },
    { value: "afternoon", title: isFr ? "Après-midi" : isAr ? "بعد الزوال" : "العشية", description: "14:00 - 18:00", icon: CalendarDays },
    { value: "evening", title: isFr ? "Soir" : "المساء", description: "18:00 - 21:00", icon: CalendarDays }
  ];

  const courseTypes: Option[] = [
    {
      value: "individual",
      title: isFr ? "Cours individuel" : "حصة فردية",
      description: isFr ? "Accompagnement personnalisé." : "مواكبة شخصية حسب مستوى الطفل.",
      icon: UserRound
    },
    {
      value: "small-group",
      title: isFr ? "Petit groupe" : isAr ? "مجموعة صغيرة" : "گروب صغير",
      description: isFr
        ? "Apprentissage collaboratif avec un nombre limité d'élèves."
        : "تعلم جماعي مع عدد محدود من التلاميذ.",
      icon: UsersRound
    },
    {
      value: "advice",
      title: isFr ? "Je souhaite être conseillé" : isAr ? "أرغب في الاستشارة" : "بغيت نصيحة",
      description: isFr
        ? "STEMORA recommande la meilleure formule."
        : isAr
          ? "يقترح فريق STEMORA الصيغة الأنسب."
          : "فريق STEMORA يقترح الصيغة اللي مناسبة.",
      icon: HelpCircle
    }
  ];

  return { experienceOptions, programs, contacts, periods, courseTypes };
}

function labelFor(list: Option[], value: string) {
  return list.find((item) => item.value === value)?.title || value;
}

export function RegistrationWizard() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const t = copy[locale];
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const schema = useMemo(() => createRegistrationSchema(locale), [locale]);
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange"
  });

  const childAge = calculateAge(form.watch("childBirthDate"));
  const isRtl = t.dir === "rtl";

  async function goNext() {
    const valid = await form.trigger(fieldsByStep[step], { shouldFocus: true });
    if (valid) setStep((current) => Math.min(current + 1, t.steps.length - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit(values: RegistrationFormValues) {
    setSubmitError("");

    if (turnstileSiteKey && !turnstileToken) {
      setSubmitError(t.captchaRequired);
      return;
    }

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken })
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || t.submitError);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t.submitError);
      setTurnstileToken("");
      setTurnstileRenderKey((current) => current + 1);
    }
  }

  if (isSuccess) return <RegistrationSuccess locale={locale} setLocale={setLocale} />;

  return (
    <main dir={t.dir} className="relative min-h-screen overflow-hidden bg-background px-4 pb-10 text-start sm:px-6">
      <Decorations />
      <Header locale={locale} setLocale={setLocale} />

      <section className="relative z-10 mx-auto max-w-5xl pt-8 text-center sm:pt-12">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm">
          <Rocket className="h-4 w-4 text-accent" aria-hidden="true" />
          {t.badge}
        </div>
        <h1 className="mt-5 text-3xl font-bold leading-tight text-navy sm:text-5xl">{t.heroTitle}</h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-navy/72 sm:text-lg">{t.heroText}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <TrustItem icon={MonitorSmartphone} label={t.trusts[0]} />
          <TrustItem icon={UsersRound} label={t.trusts[1]} />
          <TrustItem icon={Wrench} label={t.trusts[2]} />
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-8 max-w-5xl rounded-3xl border border-border bg-white/92 p-4 shadow-premium backdrop-blur sm:p-7">
        <RegistrationProgress currentStep={step} t={t} />

        <form
          className="mt-7"
          onSubmit={form.handleSubmit(submit)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && step < 4) {
              event.preventDefault();
              void goNext();
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${locale}-${step}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {step === 0 && <ChildInformationStep form={form} childAge={childAge} locale={locale} />}
              {step === 1 && <ProgramSelectionStep form={form} locale={locale} />}
              {step === 2 && <ParentInformationStep form={form} locale={locale} />}
              {step === 3 && <AvailabilityStep form={form} locale={locale} />}
              {step === 4 && <ConfirmationStep form={form} submitError={submitError} goToStep={setStep} locale={locale} />}
            </motion.div>
          </AnimatePresence>

          {step === 4 && turnstileSiteKey && (
            <div className="mt-6 rounded-2xl border border-border bg-white p-4">
              <CloudflareTurnstile
                key={turnstileRenderKey}
                siteKey={turnstileSiteKey}
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
                onError={() => {
                  setTurnstileToken("");
                  setSubmitError(t.captchaError);
                }}
              />
            </div>
          )}

          <FormNavigation
            step={step}
            isSubmitting={form.formState.isSubmitting}
            isSubmitDisabled={step === 4 && Boolean(turnstileSiteKey) && !turnstileToken}
            onBack={goBack}
            onNext={goNext}
            t={t}
            isRtl={isRtl}
          />
        </form>
      </section>
    </main>
  );
}

function Header({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  const t = copy[locale];
  return (
    <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 py-5">
      <a href="/" className="focus-ring rounded-2xl" aria-label="STEMORA">
        <Image src="/stemora-logo.svg" alt="STEMORA - Learn Build Innovate" width={300} height={86} priority className="h-12 w-auto sm:h-14" />
      </a>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-2xl border border-border bg-white p-1 shadow-sm" aria-label="Language selector">
          {(Object.keys(localeLabels) as Locale[]).map((item) => (
            <button key={item} type="button" onClick={() => setLocale(item)} className={cn("focus-ring min-h-9 rounded-xl px-3 text-xs font-bold transition", locale === item ? "bg-primary text-white" : "text-navy/70 hover:bg-primary/8")}>
              {localeLabels[item]}
            </button>
          ))}
        </div>
        <span className="hidden text-sm font-medium text-navy/68 sm:inline">{t.help}</span>
        <a href="https://wa.me/212000000000" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-2xl border border-primary/20 bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm transition hover:border-primary/40 hover:bg-primary/5">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {t.whatsapp}
        </a>
      </div>
    </header>
  );
}

function RegistrationProgress({ currentStep, t }: { currentStep: number; t: T }) {
  return (
    <div aria-label="Registration progress">
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-navy">
          <span>{t.stepCounter(currentStep + 1, t.steps.length)}</span>
          <span>{t.steps[currentStep]}</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-primary/12">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((currentStep + 1) / t.steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="hidden items-center justify-between sm:flex">
        {t.steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition", isCompleted && "border-primary bg-primary text-white", isActive && "border-accent bg-accent text-navy", !isCompleted && !isActive && "border-border bg-white text-navy/50")}>
                  {isCompleted ? <Check className="h-5 w-5" aria-hidden="true" /> : index + 1}
                </span>
                <span className={cn("text-sm font-semibold", isActive ? "text-navy" : "text-navy/56")}>{label}</span>
              </div>
              {index < t.steps.length - 1 && <div className="mx-4 h-px flex-1 bg-border"><div className={cn("h-px bg-primary transition-all", index < currentStep ? "w-full" : "w-0")} /></div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ChildInformationStep({ form, childAge, locale }: { form: WizardForm; childAge?: number; locale: Locale }) {
  const t = copy[locale];
  const { experienceOptions } = options(locale);
  const errors = form.formState.errors;
  return (
    <StepShell title={t.childTitle} subtitle={t.childSubtitle}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t.childName} error={errors.childName?.message}><Input {...form.register("childName")} hasError={Boolean(errors.childName)} autoComplete="name" /></Field>
        <Field label={t.birthDate} error={errors.childBirthDate?.message}>
          <Input type="date" {...form.register("childBirthDate")} hasError={Boolean(errors.childBirthDate)} />
          {typeof childAge === "number" && <span className="mt-2 inline-flex rounded-full bg-accent/18 px-3 py-1 text-xs font-semibold text-navy">{childAge} {t.years}</span>}
        </Field>
        <Field label={t.schoolLevel} error={errors.schoolLevel?.message}>
          <Select {...form.register("schoolLevel")} hasError={Boolean(errors.schoolLevel)}>
            <option value="">{t.select}</option>
            {t.schoolLevels.map((level) => <option key={level} value={level}>{level}</option>)}
          </Select>
        </Field>
        <Field label={t.cityCountry} error={errors.cityCountry?.message}><Input {...form.register("cityCountry")} hasError={Boolean(errors.cityCountry)} placeholder={t.cityPlaceholder} /></Field>
      </div>
      <Controller control={form.control} name="experienceLevel" render={({ field }) => (
        <ChoiceGroup label={t.experienceLabel} error={errors.experienceLevel?.message}>
          <div className="grid gap-4 md:grid-cols-2">
            {experienceOptions.map((option) => <SelectionCard key={option.value} option={option} selected={field.value === option.value} onSelect={() => field.onChange(option.value)} />)}
          </div>
        </ChoiceGroup>
      )} />
    </StepShell>
  );
}

function ProgramSelectionStep({ form, locale }: { form: WizardForm; locale: Locale }) {
  const t = copy[locale];
  const { programs } = options(locale);
  const errors = form.formState.errors;
  return (
    <StepShell title={t.programTitle} subtitle={t.programSubtitle}>
      <Controller control={form.control} name="selectedPrograms" render={({ field }) => (
        <ChoiceGroup error={errors.selectedPrograms?.message}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => <SelectionCard key={program.value} option={program} selected={field.value.includes(program.value)} onSelect={() => toggleArrayValue(field.value, program.value, field.onChange)} />)}
          </div>
          <SelectionCard className="mt-4" option={{ value: "not-sure", title: t.notSureTitle, description: t.notSureDescription, icon: HelpCircle }} selected={field.value.includes("not-sure")} onSelect={() => toggleArrayValue(field.value, "not-sure", field.onChange)} />
        </ChoiceGroup>
      )} />
    </StepShell>
  );
}

function ParentInformationStep({ form, locale }: { form: WizardForm; locale: Locale }) {
  const t = copy[locale];
  const { contacts } = options(locale);
  const errors = form.formState.errors;
  return (
    <StepShell title={t.parentTitle}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t.parentName} error={errors.parentName?.message}><Input {...form.register("parentName")} hasError={Boolean(errors.parentName)} autoComplete="name" /></Field>
        <Field label={t.phone} error={errors.parentPhone?.message}><Input {...form.register("parentPhone")} hasError={Boolean(errors.parentPhone)} autoComplete="tel" inputMode="tel" /></Field>
        <Field label={t.email} error={errors.parentEmail?.message}><Input type="email" {...form.register("parentEmail")} hasError={Boolean(errors.parentEmail)} autoComplete="email" /></Field>
      </div>
      <Controller control={form.control} name="preferredContact" render={({ field }) => (
        <ChoiceGroup label={t.preferredContact} error={errors.preferredContact?.message}>
          <div className="grid gap-4 sm:grid-cols-3">
            {contacts.map((contact) => <SelectionCard key={contact.value} option={contact} selected={field.value === contact.value} onSelect={() => field.onChange(contact.value)} />)}
          </div>
        </ChoiceGroup>
      )} />
      <p className="rounded-2xl bg-primary/6 px-4 py-3 text-sm font-medium text-navy/70">{t.privacyNote}</p>
    </StepShell>
  );
}

function AvailabilityStep({ form, locale }: { form: WizardForm; locale: Locale }) {
  const t = copy[locale];
  const { periods, courseTypes } = options(locale);
  const errors = form.formState.errors;
  return (
    <StepShell title={t.availabilityTitle}>
      <Controller control={form.control} name="preferredDays" render={({ field }) => (
        <ChoiceGroup label={t.preferredDays} error={errors.preferredDays?.message}>
          <div className="flex flex-wrap gap-3">
            {daysByLocale[locale].map((day) => {
              const selected = field.value.includes(day);
              return <button key={day} type="button" onClick={() => toggleArrayValue(field.value, day, field.onChange)} className={cn("focus-ring min-h-12 rounded-full border px-5 text-sm font-semibold transition", selected ? "border-primary bg-primary text-white shadow-sm" : "border-border bg-white text-navy hover:border-primary/40")}>{day}</button>;
            })}
          </div>
        </ChoiceGroup>
      )} />
      <Controller control={form.control} name="preferredPeriod" render={({ field }) => (
        <ChoiceGroup label={t.preferredPeriod} error={errors.preferredPeriod?.message}>
          <div className="grid gap-4 md:grid-cols-3">
            {periods.map((period) => <SelectionCard key={period.value} option={period} selected={field.value === period.value} onSelect={() => field.onChange(period.value)} />)}
          </div>
        </ChoiceGroup>
      )} />
      <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-medium text-navy/76">{t.scheduleNote}</p>
      <Controller control={form.control} name="courseType" render={({ field }) => (
        <ChoiceGroup label={t.courseType} error={errors.courseType?.message}>
          <div className="grid gap-4 md:grid-cols-3">
            {courseTypes.map((type) => <SelectionCard key={type.value} option={type} selected={field.value === type.value} onSelect={() => field.onChange(type.value)} />)}
          </div>
        </ChoiceGroup>
      )} />
    </StepShell>
  );
}

function ConfirmationStep({ form, goToStep, submitError, locale }: { form: WizardForm; goToStep: (step: number) => void; submitError: string; locale: Locale }) {
  const t = copy[locale];
  const allOptions = options(locale);
  const values = form.watch();
  const errors = form.formState.errors;
  const age = calculateAge(values.childBirthDate);
  const programLabels = values.selectedPrograms.map((value) => value === "not-sure" ? t.notSureTitle : labelFor(allOptions.programs, value));
  const groups = [
    { title: t.groups.child, step: 0, rows: [values.childName, age ? `${age} ${t.years}` : "", values.cityCountry].filter(Boolean) },
    { title: t.groups.level, step: 0, rows: [values.schoolLevel, labelFor(allOptions.experienceOptions, values.experienceLevel)].filter(Boolean) },
    { title: t.groups.programs, step: 1, rows: programLabels },
    { title: t.groups.parent, step: 2, rows: [values.parentName, values.parentEmail].filter(Boolean) },
    { title: t.groups.contact, step: 2, rows: [values.parentPhone, labelFor(allOptions.contacts, values.preferredContact)].filter(Boolean) },
    { title: t.groups.availability, step: 3, rows: [...values.preferredDays, labelFor(allOptions.periods, values.preferredPeriod)].filter(Boolean) },
    { title: t.groups.course, step: 3, rows: [labelFor(allOptions.courseTypes, values.courseType)].filter(Boolean) }
  ];

  return (
    <StepShell title={t.confirmationTitle}>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title} className="rounded-2xl border border-border bg-background/45 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-navy">{group.title}</h3>
              <button type="button" onClick={() => goToStep(group.step)} className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/8">{t.edit}</button>
            </div>
            <div className="mt-3 space-y-1 text-sm font-medium text-navy/68">{group.rows.length > 0 ? group.rows.map((row) => <p key={row}>{row}</p>) : <p>-</p>}</div>
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
        <label className="flex gap-3 text-sm font-medium leading-6 text-navy"><Checkbox {...form.register("contactConsent")} /><span>{t.consent}</span></label>
        {errors.contactConsent?.message && <ErrorText message={errors.contactConsent.message} />}
        <label className="flex gap-3 text-sm font-medium leading-6 text-navy/76"><Checkbox {...form.register("marketingConsent")} /><span>{t.marketing}</span></label>
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-primary/7 px-4 py-3 text-sm font-semibold text-navy/75">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span>{t.protected}</span>
      </div>
      {submitError && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{submitError}</p>}
    </StepShell>
  );
}

function FormNavigation({ step, isSubmitting, isSubmitDisabled, onBack, onNext, t, isRtl }: { step: number; isSubmitting: boolean; isSubmitDisabled: boolean; onBack: () => void; onNext: () => void; t: T; isRtl: boolean }) {
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;
  return (
    <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-border bg-white/94 p-4 backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:p-0">
      {step > 0 ? <Button type="button" variant="secondary" onClick={onBack}><BackIcon className="h-4 w-4" aria-hidden="true" />{t.back}</Button> : <span />}
      {step < 4 ? <Button type="button" onClick={onNext} size="lg">{t.next}<NextIcon className="h-4 w-4" aria-hidden="true" /></Button> : <Button type="submit" size="lg" disabled={isSubmitting || isSubmitDisabled}><LockKeyhole className="h-4 w-4" aria-hidden="true" />{isSubmitting ? t.submitting : t.submit}<NextIcon className="h-4 w-4" aria-hidden="true" /></Button>}
    </div>
  );
}

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-navy/66 sm:text-base">{subtitle}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-navy">{label}</span>
      {children}
      {error && <ErrorText message={error} />}
    </label>
  );
}

function ChoiceGroup({ label, error, children }: { label?: string; error?: string | FieldErrors | (string | undefined)[]; children: React.ReactNode }) {
  const message = typeof error === "string" ? error : undefined;
  return (
    <fieldset>
      {label && <legend className="mb-3 text-sm font-semibold text-navy">{label}</legend>}
      {children}
      {message && <ErrorText message={message} />}
    </fieldset>
  );
}

function SelectionCard({ option, selected, onSelect, className }: { option: Option; selected: boolean; onSelect: () => void; className?: string }) {
  const Icon = option.icon;
  return (
    <button type="button" aria-pressed={selected} onClick={onSelect} className={cn("focus-ring relative min-h-[116px] w-full rounded-2xl border p-4 text-start transition", selected ? "border-primary bg-primary/7 shadow-soft" : "border-border bg-white hover:border-primary/35 hover:bg-primary/4", className)}>
      <span className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-2xl", selected ? "bg-accent text-navy" : "bg-primary/8 text-primary")}><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <span className="block pe-8 text-base font-bold text-navy">{option.title}</span>
      {option.description && <span className="mt-1 block text-sm leading-5 text-navy/62">{option.description}</span>}
      {selected && <span className="absolute end-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white"><Check className="h-4 w-4" aria-hidden="true" /></span>}
    </button>
  );
}

function TrustItem({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy/76 shadow-sm"><Icon className="h-4 w-4 text-primary" aria-hidden="true" />{label}</span>;
}

function RegistrationSuccess({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  const t = copy[locale];
  return (
    <main dir={t.dir} className="relative min-h-screen overflow-hidden bg-background px-4 py-6 text-start sm:px-6">
      <Decorations />
      <Header locale={locale} setLocale={setLocale} />
      <section className="relative z-10 mx-auto mt-10 max-w-3xl rounded-3xl border border-border bg-white p-6 text-center shadow-premium sm:p-10">
        <motion.div initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 14 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-soft"><CheckCircle2 className="h-11 w-11" aria-hidden="true" /></motion.div>
        <h1 className="mt-6 text-3xl font-bold text-navy sm:text-4xl">{t.successTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-navy/70">{t.successText}</p>
        <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-background/70 p-5 text-start">
          <h2 className="font-bold text-navy">{t.nextStep}</h2>
          <ol className="mt-4 space-y-3 text-sm font-medium text-navy/72">
            {t.successSteps.map((item, index) => <li key={item} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-navy">{index + 1}</span><span className="pt-1">{item}</span></li>)}
          </ol>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" size="lg" onClick={() => window.location.assign("https://wa.me/212000000000")}><MessageCircle className="h-5 w-5" aria-hidden="true" />{t.whatsappCta}</Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => window.location.assign("/")}>{t.home}</Button>
        </div>
      </section>
    </main>
  );
}

function ErrorText({ message }: { message: string }) {
  return <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{message}</p>;
}

function Decorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-8 top-32 text-4xl font-bold text-primary/10">&lt;/&gt;</div>
      <div className="absolute right-10 top-40 grid grid-cols-3 gap-2 opacity-20">{Array.from({ length: 9 }).map((_, index) => <span key={index} className="h-2 w-2 rounded-sm bg-accent" />)}</div>
      <div className="absolute bottom-20 left-12 h-28 w-28 rounded-full border border-primary/10" />
      <div className="absolute bottom-32 right-16 h-24 w-24 rotate-12 rounded-3xl border border-accent/25" />
      <div className="absolute left-1/2 top-24 h-px w-56 -translate-x-1/2 bg-primary/10"><span className="absolute -top-1 left-0 h-3 w-3 rounded-full bg-primary/20" /><span className="absolute -top-1 right-0 h-3 w-3 rounded-full bg-accent/40" /></div>
    </div>
  );
}

function toggleArrayValue(current: string[], value: string, onChange: (nextValue: string[]) => void) {
  onChange(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
}
