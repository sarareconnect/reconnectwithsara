import { z } from "zod";

/** Optional string that treats empty strings as undefined. */
const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal("").transform(() => undefined));

const phone = z
  .string()
  .trim()
  .regex(/^[+0-9][0-9\s().-]{4,19}$/, "Enter a valid phone number");

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Enterprise
// ---------------------------------------------------------------------------

export const enterpriseCreateSchema = z.object({
  name: z.string().trim().min(2, "Enterprise name is required").max(120),
  managerName: z.string().trim().min(2, "Manager name is required").max(120),
  managerEmail: z.string().trim().email("Valid email is required"),
  managerPhone: phone.optional().or(z.literal("").transform(() => undefined)),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, . _ - allowed"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  status: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE"),
});
export type EnterpriseCreateInput = z.infer<typeof enterpriseCreateSchema>;

export const enterpriseUpdateSchema = enterpriseCreateSchema
  .partial()
  .extend({
    id: z.string().min(1),
    // password optional on update — only changes when provided
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .optional()
      .or(z.literal("").transform(() => undefined)),
  });
export type EnterpriseUpdateInput = z.infer<typeof enterpriseUpdateSchema>;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const customButtonSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: z.string().trim().url(),
});
export type CustomButton = z.infer<typeof customButtonSchema>;

export const storeBaseSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required").max(160),
  offerTitle: optionalString,
  benefits: z.array(z.string().trim().min(1)).default([]),
  phone: phone.optional().or(z.literal("").transform(() => undefined)),
  whatsapp: phone.optional().or(z.literal("").transform(() => undefined)),
  mapsLink: optionalUrl,
  instagram: optionalString,
  youtube: optionalString,
  facebook: optionalString,
  storeLink: optionalUrl,
  customButtons: z.array(customButtonSchema).default([]),
  active: z.boolean().default(true),
});

export const storeCreateSchema = storeBaseSchema.extend({
  enterpriseId: z.string().min(1),
});
export type StoreCreateInput = z.infer<typeof storeCreateSchema>;

export const storeUpdateSchema = storeBaseSchema.partial().extend({
  id: z.string().min(1),
});
export type StoreUpdateInput = z.infer<typeof storeUpdateSchema>;

// ---------------------------------------------------------------------------
// Bulk operations
// ---------------------------------------------------------------------------

export const bulkOfferSchema = z.object({
  enterpriseId: z.string().min(1),
  offerTitle: z.string().trim().min(1, "Offer title is required").max(200),
  benefits: z.array(z.string().trim().min(1)).default([]),
  /** When empty, the offer is applied to ALL stores of the enterprise. */
  storeIds: z.array(z.string().min(1)).default([]),
});
export type BulkOfferInput = z.infer<typeof bulkOfferSchema>;

/**
 * Canonical CSV row schema. Header names are normalised before validation
 * (see csv.ts). Benefits and custom buttons accept delimited strings.
 */
export const csvRowSchema = z.object({
  store_name: z.string().trim().min(1, "store_name is required"),
  offer_title: z.string().trim().optional().default(""),
  benefits: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  whatsapp: z.string().trim().optional().default(""),
  maps_link: z.string().trim().optional().default(""),
  instagram: z.string().trim().optional().default(""),
  youtube: z.string().trim().optional().default(""),
  facebook: z.string().trim().optional().default(""),
  store_link: z.string().trim().optional().default(""),
  custom_buttons: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  slug: z.string().trim().optional().default(""),
});
export type CsvRow = z.infer<typeof csvRowSchema>;
