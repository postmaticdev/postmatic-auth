import { publicEnv } from "@/constants"

const landing = publicEnv.NEXT_PUBLIC_LANDING_PAGE_URL

// Dokumen legal Postmatic yang dihosting di landing page.
export const legalLinks = {
  termsAndConditions: { label: "Terms & Conditions", href: `${landing}/terms-and-conditions` },
  termsOfService: { label: "Terms of Service", href: `${landing}/terms-of-service` },
  privacyPolicy: { label: "Privacy Policy", href: `${landing}/privacy-policy` },
  dataDeletion: { label: "Data Deletion", href: `${landing}/data-deletion` },
  cookiePolicy: { label: "Cookie Policy", href: `${landing}/cookie-policy` },
} as const
