import { z } from "zod";

/**
 * Step 1: Customer Identity and Delivery Location Schema
 */
export const CustomerIdentitySchema = z.object({
  fullName: z
    .string()
    .min(2, "Please enter your full name")
    .max(60, "Name is too long"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type CustomerIdentity = z.infer<typeof CustomerIdentitySchema>;

/**
 * Pincode service lookup response schema
 */
export const PincodeLookupResultSchema = z.object({
  available: z.boolean(),
  city: z.string(),
  state: z.string(),
  estimatedDays: z.string(),
  deliveryFee: z.number().default(0), // Free factory delivery
});

export type PincodeLookupResult = z.infer<typeof PincodeLookupResultSchema>;

/**
 * Step 3: Payment Plan Selection Schema
 */
export const PaymentPlanSchema = z.enum(["token_advance", "full_payment"]);
export type PaymentPlan = z.infer<typeof PaymentPlanSchema>;

/**
 * Final Order Submission Payload Schema
 */
export const CheckoutOrderSchema = z.object({
  customer: CustomerIdentitySchema,
  productId: z.string(),
  productName: z.string(),
  variantId: z.string(),
  variantName: z.string(),
  productPrice: z.number().positive(),
  paymentPlan: PaymentPlanSchema,
  amountPayableNow: z.number().positive(),
  balanceOnDelivery: z.number().nonnegative(),
});

export type CheckoutOrder = z.infer<typeof CheckoutOrderSchema>;

/**
 * Order Creation Response Schema
 */
export const OrderCreationResultSchema = z.object({
  success: z.boolean(),
  orderId: z.string(),
  upiPaymentLink: z.string().url().optional(),
  message: z.string(),
});

export type OrderCreationResult = z.infer<typeof OrderCreationResultSchema>;
