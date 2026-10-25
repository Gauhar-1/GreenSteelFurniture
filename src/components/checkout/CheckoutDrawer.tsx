"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Drawer } from "vaul";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Smartphone,
  Sparkles,
  MapPin,
  Clock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CustomerIdentitySchema,
  type CustomerIdentity,
  type PaymentPlan,
} from "@/types/checkout";
import { lookupPincode, createTokenOrder } from "@/actions/checkout";
import type { Product, MediaVariant } from "@/types/product";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedVariant: MediaVariant | null;
}

type CheckoutStep = 1 | 2 | 3 | "confirmed";

/**
 * CheckoutDrawer — Client Component
 * 
 * Mobile-first slide-up bottom sheet powered by Vaul:
 * - Frictionless 3-step state machine without page refresh
 * - Step 1: Minimum typing (Name, 10-digit mobile, 6-digit Pincode with instant availability)
 * - Step 2: Order summary, delivery timeline, and physical inspection guarantee
 * - Step 3: Token Advance (₹500) vs Full Payment with instant discount
 */
export function CheckoutDrawer({
  isOpen,
  onClose,
  product,
  selectedVariant,
}: CheckoutDrawerProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [pincodeStatus, setPincodeStatus] = useState<{
    loading: boolean;
    available: boolean;
    city: string;
    state: string;
    days: string;
  } | null>(null);

  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("token_advance");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  // Form setup using react-hook-form and zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CustomerIdentity>({
    resolver: zodResolver(CustomerIdentitySchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      pincode: "",
    },
    mode: "onChange",
  });

  const watchedPincode = watch("pincode");
  const customerValues = watch();

  // Reset drawer state when product or openness changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setConfirmedOrderId(null);
    }
  }, [isOpen, product]);

  // UX Magic: Pincode lookup listener triggering when 6 digits are typed
  useEffect(() => {
    const cleanPin = (watchedPincode || "").trim();
    if (cleanPin.length === 6 && /^\d{6}$/.test(cleanPin)) {
      setPincodeStatus({
        loading: true,
        available: false,
        city: "",
        state: "",
        days: "",
      });

      lookupPincode(cleanPin)
        .then((res) => {
          if (res.available) {
            setPincodeStatus({
              loading: false,
              available: true,
              city: res.city,
              state: res.state,
              days: res.estimatedDays,
            });
            setValue("city", res.city);
            setValue("state", res.state);
          } else {
            setPincodeStatus({
              loading: false,
              available: false,
              city: "",
              state: "",
              days: "",
            });
          }
        })
        .catch(() => {
          setPincodeStatus(null);
        });
    } else {
      setPincodeStatus(null);
    }
  }, [watchedPincode, setValue]);

  if (!product) {
    return null;
  }

  const activeVariant =
    selectedVariant ||
    product.media.variants[0] || {
      id: "default",
      name: "Standard",
      hex: "#1E3A8A",
      outsideImageUrl: product.media.outsideView,
      insideImageUrl: product.media.insideView,
    };

  const productPrice = product.price;
  const tokenAdvance = 500;
  const fullPaymentDiscount = 500;

  const isTokenPlan = paymentPlan === "token_advance";
  const amountPayableNow = isTokenPlan ? tokenAdvance : productPrice - fullPaymentDiscount;
  const balanceOnDelivery = isTokenPlan ? productPrice - tokenAdvance : 0;

  // Step 1 Submission: Validates identity and location
  const onStep1Submit = () => {
    setCurrentStep(2);
  };

  // Step 3 Submission: Finalize Token or Full Order
  const handleFinalOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          fullName: customerValues.fullName,
          mobile: customerValues.mobile,
          pincode: customerValues.pincode,
          city: customerValues.city || pincodeStatus?.city,
          state: customerValues.state || pincodeStatus?.state,
        },
        productId: product.id,
        productName: product.name,
        variantId: activeVariant.id,
        variantName: activeVariant.name,
        productPrice,
        paymentPlan,
        amountPayableNow,
        balanceOnDelivery,
      };

      const result = await createTokenOrder(orderPayload);
      if (result.success) {
        setConfirmedOrderId(result.orderId);
        setCurrentStep("confirmed");
      }
    } catch (err) {
      console.error("[Checkout] Order creation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Drawer.Portal>
        {/* Blurred backdrop keeping product slightly visible */}
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" />

        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[92vh] flex-col rounded-t-[28px] bg-[#FAF9F6] border-t border-[#E7E0D2] shadow-2xl outline-none">
          {/* Mobile Swipe Handle */}
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-[#1E3A8A]/25" />

          {/* Accessible Hidden Headers for Screen Readers */}
          <Drawer.Title className="sr-only">
            Instant Token Checkout — {product.name}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Reserve factory-direct steel furniture with a small ₹500 token advance.
          </Drawer.Description>

          <div className="overflow-y-auto px-4 pb-8 pt-3 sm:px-6 max-w-lg mx-auto w-full">
            {/* 3-Step Visual Progress Indicator */}
            {currentStep !== "confirmed" && (
              <div className="mb-4 flex items-center justify-between border-b border-[#E7E0D2] pb-3">
                <div className="flex items-center gap-1.5">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStep((prev) => (prev === 3 ? 2 : 1))
                      }
                      className="p-1 -ml-1 text-[#1E3A8A] hover:text-[#D97706] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                      aria-label="Go back to previous step"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-sm font-extrabold text-[#1E3A8A]">
                    {currentStep === 1 && "1. Delivery Details"}
                    {currentStep === 2 && "2. Order Review"}
                    {currentStep === 3 && "3. Payment Choice"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#1E3A8A]/75">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                      currentStep >= 1
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-[#EAE3D5] text-[#1E3A8A]/60"
                    )}
                  >
                    1
                  </span>
                  <span className="w-3 h-0.5 bg-[#EAE3D5]" />
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                      currentStep >= 2
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-[#EAE3D5] text-[#1E3A8A]/60"
                    )}
                  >
                    2
                  </span>
                  <span className="w-3 h-0.5 bg-[#EAE3D5]" />
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                      currentStep === 3
                        ? "bg-[#D97706] text-white"
                        : "bg-[#EAE3D5] text-[#1E3A8A]/60"
                    )}
                  >
                    3
                  </span>
                </div>
              </div>
            )}

            {/* ================= STEP 1: IDENTITY & LOCATION ================= */}
            {currentStep === 1 && (
              <form onSubmit={handleSubmit(onStep1Submit)} className="flex flex-col gap-4">
                <div className="bg-[#F3EFE6] p-3 rounded-xl border border-[#E7E0D2] flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#E5DFD1]">
                    <Image
                      src={activeVariant.outsideImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1E3A8A] truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-[#1E3A8A]/75">
                      Color: <span className="font-semibold">{activeVariant.name}</span> • ₹{productPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* 1. Full Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullName" className="text-xs font-bold text-[#1E3A8A]">
                    Full Name (पूरा नाम) *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Ramesh Kumar Verma"
                    {...register("fullName")}
                    className={cn(
                      "w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-white/70 border text-sm text-[#1E3A8A] placeholder-[#1E3A8A]/40 outline-none transition-all focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]",
                      errors.fullName ? "border-red-500" : "border-[#E7E0D2]"
                    )}
                  />
                  {errors.fullName && (
                    <span className="text-[11px] font-semibold text-red-600">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* 2. Mobile Number Input (10 digits only, auto keypad) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mobile" className="text-xs font-bold text-[#1E3A8A]">
                    Mobile Number (मोबाइल नंबर) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-[#1E3A8A]/70 select-none">
                      +91
                    </span>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      placeholder="9876543210"
                      {...register("mobile")}
                      className={cn(
                        "w-full min-h-[48px] pl-12 pr-3.5 py-2.5 rounded-xl bg-white/70 border text-sm text-[#1E3A8A] font-medium tracking-wide placeholder-[#1E3A8A]/40 outline-none transition-all focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]",
                        errors.mobile ? "border-red-500" : "border-[#E7E0D2]"
                      )}
                    />
                  </div>
                  {errors.mobile && (
                    <span className="text-[11px] font-semibold text-red-600">
                      {errors.mobile.message}
                    </span>
                  )}
                </div>

                {/* 3. 6-Digit Pincode Input (Numeric keypad) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pincode" className="text-xs font-bold text-[#1E3A8A]">
                    Delivery Pincode (पिनकोड) *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="e.g. 273001"
                      {...register("pincode")}
                      className={cn(
                        "w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-white/70 border text-sm text-[#1E3A8A] font-semibold tracking-wider placeholder-[#1E3A8A]/40 outline-none transition-all focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]",
                        errors.pincode ? "border-red-500" : "border-[#E7E0D2]"
                      )}
                    />
                    <div className="absolute right-3">
                      <MapPin className="w-4 h-4 text-[#1E3A8A]/50" />
                    </div>
                  </div>
                  {errors.pincode && (
                    <span className="text-[11px] font-semibold text-red-600">
                      {errors.pincode.message}
                    </span>
                  )}

                  {/* UX MAGIC: Instant Delivery Availability Banner */}
                  {pincodeStatus && pincodeStatus.available && (
                    <div className="mt-1 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-xs font-bold text-emerald-800 leading-tight">
                        Delivery Available in {pincodeStatus.city}, {pincodeStatus.state}!{" "}
                        <span className="font-normal text-emerald-700">
                          ({pincodeStatus.days})
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Action: Continue Button (Min 44x44px target) */}
                <button
                  type="submit"
                  className="mt-2 w-full min-h-[48px] rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-md active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
                >
                  Continue to Order Review
                </button>
              </form>
            )}

            {/* ================= STEP 2: ORDER SUMMARY & REASSURANCE ================= */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-4">
                {/* Product & Variant Card */}
                <div className="p-4 rounded-2xl bg-[#F3EFE6] border border-[#E7E0D2] flex gap-3.5 items-center">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#E5DFD1]">
                    <Image
                      src={activeVariant.outsideImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1E3A8A]/10 text-[#1E3A8A]">
                      {product.attributes.gauge}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-[#1E3A8A] leading-tight truncate mt-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#1E3A8A]/75 mt-0.5">
                      Color Finish: <span className="font-semibold text-[#1E3A8A]">{activeVariant.name}</span>
                    </p>
                    <p className="text-base font-extrabold text-[#1E3A8A] mt-1">
                      ₹{productPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Delivery Estimate Block */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-[#D97706]/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Truck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#1E3A8A]">
                      Expected Delivery in 3-5 Days
                    </h5>
                    <p className="text-[11px] text-[#1E3A8A]/75">
                      Dispatch directly from factory to {customerValues.city || "your doorstep"}, {customerValues.pincode}.
                    </p>
                  </div>
                </div>

                {/* Reassurance Checklist */}
                <div className="p-3.5 rounded-xl bg-white/60 border border-[#E7E0D2] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Open & inspect physical steel before paying remaining balance</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
                    <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>{product.attributes.warranty || "10-15 Years Anti-Rust Warranty"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
                    <Lock className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                    <span>Zero risk • 100% Refundable Token Advance if damaged</span>
                  </div>
                </div>

                {/* Action: Proceed to Payment */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="mt-1 w-full min-h-[48px] rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-md active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
                >
                  Proceed to Payment Selection
                </button>
              </div>
            )}

            {/* ================= STEP 3: TOKEN ADVANCE PAYMENT SELECTION ================= */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-3.5">
                <div className="text-center sm:text-left">
                  <h4 className="text-base font-extrabold text-[#1E3A8A]">
                    Select Your Payment Preference
                  </h4>
                  <p className="text-xs text-[#1E3A8A]/75 mt-0.5">
                    Pay only a small token now to confirm production & delivery slot.
                  </p>
                </div>

                {/* Card A (Primary / Recommended): Pay ₹500 Token Advance */}
                <div
                  role="radio"
                  aria-checked={paymentPlan === "token_advance"}
                  onClick={() => setPaymentPlan("token_advance")}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all cursor-pointer touch-manipulation select-none flex flex-col gap-2.5",
                    paymentPlan === "token_advance"
                      ? "border-[#D97706] bg-amber-500/10 shadow-md shadow-amber-900/10"
                      : "border-[#E7E0D2] bg-[#F3EFE6] hover:border-[#D97706]/40"
                  )}
                >
                  {/* Most Popular Badge */}
                  <div className="absolute -top-2.5 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white bg-[#D97706] shadow-sm uppercase tracking-wide">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          paymentPlan === "token_advance"
                            ? "border-[#D97706] bg-[#D97706] text-white"
                            : "border-[#1E3A8A]/40"
                        )}
                      >
                        {paymentPlan === "token_advance" && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#1E3A8A]">
                          Pay ₹500 Token Advance via UPI
                        </p>
                        <p className="text-xs font-semibold text-[#D97706]">
                          Balance ₹{(productPrice - 500).toLocaleString("en-IN")} on Delivery (Cash/UPI)
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#1E3A8A]/70 pl-7 leading-relaxed">
                    Zero financial risk. Inspect the almirah in your bedroom first, then hand over the balance.
                  </p>
                </div>

                {/* Card B: Pay Full Amount with ₹500 Instant Discount */}
                <div
                  role="radio"
                  aria-checked={paymentPlan === "full_payment"}
                  onClick={() => setPaymentPlan("full_payment")}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer touch-manipulation select-none flex flex-col gap-2",
                    paymentPlan === "full_payment"
                      ? "border-[#1E3A8A] bg-[#1E3A8A]/10 shadow-md"
                      : "border-[#E7E0D2] bg-[#F3EFE6] hover:border-[#1E3A8A]/40"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          paymentPlan === "full_payment"
                            ? "border-[#1E3A8A] bg-[#1E3A8A] text-white"
                            : "border-[#1E3A8A]/40"
                        )}
                      >
                        {paymentPlan === "full_payment" && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#1E3A8A]">
                          Pay Full Amount (Prepaid Discount)
                        </p>
                        <p className="text-xs font-semibold text-emerald-700">
                          Instant ₹500 OFF • Total ₹{(productPrice - 500).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#1E3A8A]/70 pl-7">
                    Save ₹500 instantly by clearing full payment upfront via UPI.
                  </p>
                </div>

                {/* Action: Pulsing Full-Width Amber Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalOrder}
                  className="mt-2 w-full min-h-[52px] rounded-xl bg-[#D97706] hover:bg-[#F59E0B] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 active:scale-[0.98] transition-all cursor-pointer touch-manipulation animate-pulse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>
                    {isSubmitting
                      ? "Connecting to UPI..."
                      : `Pay ₹${amountPayableNow.toLocaleString("en-IN")} Securely via UPI`}
                  </span>
                </button>

                {/* Trusted UPI Logos Representation */}
                <div className="pt-2 flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-3 text-xs font-bold text-[#1E3A8A]/80">
                    <span className="px-2 py-0.5 rounded bg-white/70 border border-[#E7E0D2]">
                      PhonePe
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/70 border border-[#E7E0D2]">
                      Google Pay
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/70 border border-[#E7E0D2]">
                      Paytm
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/70 border border-[#E7E0D2]">
                      BHIM UPI
                    </span>
                  </div>
                  <p className="text-[10px] text-[#1E3A8A]/60 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    256-bit Encrypted Direct Bank UPI Gateway
                  </p>
                </div>
              </div>
            )}

            {/* ================= STEP 4: ORDER CONFIRMED VIEW ================= */}
            {currentStep === "confirmed" && (
              <div className="py-4 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
                    Booking Successful
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E3A8A] mt-0.5">
                    Order #{confirmedOrderId} Confirmed!
                  </h3>
                  <p className="text-xs text-[#1E3A8A]/80 mt-1 max-w-sm">
                    {paymentPlan === "token_advance"
                      ? `Your ₹500 token advance is received. Our factory team will dispatch your ${product.name} within 24 hours.`
                      : `Your full payment is received with ₹500 discount. Priority dispatch initiated!`}
                  </p>
                </div>

                <div className="w-full p-4 rounded-xl bg-[#F3EFE6] border border-[#E7E0D2] text-left flex flex-col gap-1.5 text-xs text-[#1E3A8A]">
                  <p>
                    <strong>Customer:</strong> {customerValues.fullName} (+91 {customerValues.mobile})
                  </p>
                  <p>
                    <strong>Delivery Location:</strong> {customerValues.city || "Tier-3 Hub"}, {customerValues.pincode}
                  </p>
                  <p>
                    <strong>Balance on Delivery:</strong> ₹{balanceOnDelivery.toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full min-h-[48px] rounded-xl bg-[#1E3A8A] text-white font-bold text-sm shadow-md mt-2 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
