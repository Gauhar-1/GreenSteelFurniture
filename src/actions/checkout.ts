"use server";

import {
  CustomerIdentitySchema,
  CheckoutOrderSchema,
  type PincodeLookupResult,
  type CheckoutOrder,
  type OrderCreationResult,
} from "@/types/checkout";
import { z } from "zod";

/**
 * Pincode to Tier-3 hub mock directory
 */
const PINCODE_MAP: Record<string, { city: string; state: string; days: string }> = {
  "273001": { city: "Gorakhpur", state: "Uttar Pradesh", days: "2-3 Days" },
  "221001": { city: "Varanasi", state: "Uttar Pradesh", days: "2-4 Days" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh", days: "2-3 Days" },
  "800001": { city: "Patna", state: "Bihar", days: "3-4 Days" },
  "834001": { city: "Ranchi", state: "Jharkhand", days: "3-5 Days" },
  "452001": { city: "Indore", state: "Madhya Pradesh", days: "3-4 Days" },
  "751001": { city: "Bhubaneswar", state: "Odisha", days: "3-5 Days" },
  "302001": { city: "Jaipur", state: "Rajasthan", days: "2-4 Days" },
};

/**
 * Server Action: Validates pincode and returns delivery availability
 */
export async function lookupPincode(rawPincode: string): Promise<PincodeLookupResult> {
  // Boundary validation with Zod
  const validation = z.string().regex(/^\d{6}$/).safeParse(rawPincode);
  if (!validation.success) {
    return {
      available: false,
      city: "",
      state: "",
      estimatedDays: "",
      deliveryFee: 0,
    };
  }

  const pincode = validation.data;
  const match = PINCODE_MAP[pincode];

  // Simulating realistic regional dispatch for Tier-3 pin codes
  if (match) {
    return {
      available: true,
      city: match.city,
      state: match.state,
      estimatedDays: match.days,
      deliveryFee: 0,
    };
  }

  // Fallback heuristic based on standard Indian postal zone prefixes
  const zone = pincode.charAt(0);
  let city = "Regional Hub";
  let state = "India";

  switch (zone) {
    case "2":
      city = "Purvanchal Hub";
      state = "Uttar Pradesh";
      break;
    case "8":
      city = "Patna Central";
      state = "Bihar";
      break;
    case "4":
      city = "Bhopal Region";
      state = "Madhya Pradesh";
      break;
    case "7":
      city = "Eastern Hub";
      state = "Odisha/Bengal";
      break;
    case "3":
      city = "Western Hub";
      state = "Rajasthan/Gujarat";
      break;
    default:
      city = "Direct Factory Hub";
      state = "All Tier-3 Districts";
  }

  return {
    available: true,
    city,
    state,
    estimatedDays: "3-5 Days",
    deliveryFee: 0,
  };
}

/**
 * Server Action: Creates a token advance checkout order
 */
export async function createTokenOrder(
  rawOrder: CheckoutOrder
): Promise<OrderCreationResult> {
  // Boundary validation at Server Action entry
  const parsed = CheckoutOrderSchema.safeParse(rawOrder);
  if (!parsed.success) {
    return {
      success: false,
      orderId: "",
      message: "Invalid order details. Please check your contact information.",
    };
  }

  const order = parsed.data;
  const orderNumber = `GSF-${Math.floor(100000 + Math.random() * 900000)}`;

  // Simulating UPI payment link generation (e.g. UPI deep link)
  const upiUri = `upi://pay?pa=greensteel@upi&pn=GreenSteelFurniture&am=${order.amountPayableNow}&cu=INR&tn=${orderNumber}`;

  return {
    success: true,
    orderId: orderNumber,
    upiPaymentLink: upiUri,
    message:
      order.paymentPlan === "token_advance"
        ? `Order ${orderNumber} reserved! Pay ₹${order.amountPayableNow} via UPI now. Balance ₹${order.balanceOnDelivery.toLocaleString(
            "en-IN"
          )} payable upon physical delivery & inspection.`
        : `Order ${orderNumber} confirmed with ₹500 instant prepaid discount!`,
  };
}
