import { z } from "zod";

const phoneRegex = /^\+?[0-9\s().-]{8,20}$/;

const messages = {
  fr: {
    childName: "Veuillez saisir le nom de l'enfant.",
    childBirthDate: "Veuillez sélectionner la date de naissance.",
    schoolLevel: "Veuillez sélectionner le niveau scolaire.",
    cityCountry: "Veuillez indiquer la ville et le pays.",
    experienceLevel: "Veuillez sélectionner le niveau en programmation.",
    selectedPrograms: "Veuillez sélectionner au moins un programme.",
    parentName: "Veuillez saisir le nom du parent.",
    parentPhone: "Veuillez saisir un numéro de téléphone valide.",
    parentEmail: "Veuillez saisir une adresse e-mail valide.",
    preferredContact: "Veuillez sélectionner un moyen de contact.",
    preferredDays: "Veuillez choisir au moins un jour.",
    preferredPeriod: "Veuillez choisir une période.",
    courseType: "Veuillez choisir un type de cours.",
    contactConsent: "Veuillez accepter d'être contacté par STEMORA."
  },
  ar: {
    childName: "يرجى إدخال اسم الطفل.",
    childBirthDate: "يرجى اختيار تاريخ الميلاد.",
    schoolLevel: "يرجى اختيار المستوى الدراسي.",
    cityCountry: "يرجى إدخال المدينة والبلد.",
    experienceLevel: "يرجى اختيار مستوى الطفل في البرمجة.",
    selectedPrograms: "يرجى اختيار برنامج واحد على الأقل.",
    parentName: "يرجى إدخال الاسم الكامل للولي.",
    parentPhone: "يرجى إدخال رقم هاتف صحيح.",
    parentEmail: "يرجى إدخال بريد إلكتروني صحيح.",
    preferredContact: "يرجى اختيار وسيلة التواصل المفضلة.",
    preferredDays: "يرجى اختيار يوم واحد على الأقل.",
    preferredPeriod: "يرجى اختيار الفترة المناسبة.",
    courseType: "يرجى اختيار نوع الحصة.",
    contactConsent: "يرجى الموافقة على أن تتواصل STEMORA معك بخصوص طلب التسجيل."
  },
  darija: {
    childName: "دخل اسم الطفل من فضلك.",
    childBirthDate: "اختار تاريخ الازدياد من فضلك.",
    schoolLevel: "اختار المستوى الدراسي.",
    cityCountry: "دخل المدينة والبلد.",
    experienceLevel: "اختار مستوى الطفل فالبرمجة.",
    selectedPrograms: "اختار برنامج واحد على الأقل.",
    parentName: "دخل الاسم الكامل ديال الولي.",
    parentPhone: "دخل رقم هاتف صحيح.",
    parentEmail: "دخل إيميل صحيح.",
    preferredContact: "اختار طريقة التواصل المفضلة.",
    preferredDays: "اختار يوم واحد على الأقل.",
    preferredPeriod: "اختار الفترة المناسبة.",
    courseType: "اختار نوع الحصة.",
    contactConsent: "خاصك توافق باش STEMORA تتواصل معاك بخصوص طلب التسجيل."
  }
};

export type RegistrationLocale = keyof typeof messages;

export function createRegistrationSchema(locale: RegistrationLocale = "fr") {
  const message = messages[locale];

  return z.object({
  childName: z.string().trim().min(2, message.childName),
  childBirthDate: z.string().min(1, message.childBirthDate),
  schoolLevel: z.string().min(1, message.schoolLevel),
  cityCountry: z.string().trim().min(2, message.cityCountry),
  experienceLevel: z.string().min(1, message.experienceLevel),
  selectedPrograms: z.array(z.string()).min(1, message.selectedPrograms),
  parentName: z.string().trim().min(2, message.parentName),
  parentPhone: z.string().trim().regex(phoneRegex, message.parentPhone),
  parentEmail: z.string().trim().email(message.parentEmail),
  preferredContact: z.string().min(1, message.preferredContact),
  preferredDays: z.array(z.string()).min(1, message.preferredDays),
  preferredPeriod: z.string().min(1, message.preferredPeriod),
  courseType: z.string().min(1, message.courseType),
  contactConsent: z.literal(true, {
    errorMap: () => ({ message: message.contactConsent })
  }),
  marketingConsent: z.boolean().default(false)
});
}

export const registrationSchema = createRegistrationSchema("fr");

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function calculateAge(value?: string) {
  if (!value) return undefined;
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : undefined;
}
