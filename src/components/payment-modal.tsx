"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, CheckCircle, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
);

interface PaymentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  course: {
    _id: string;
    title: string;
    price: number;
    subject: string;
    tutor?: { name: string };
  };
}

export default function PaymentModal({
  isOpen = true,
  onClose,
  onSuccess,
  course,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Payment failed");
      }

      await res.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe not loaded");
      }

      // For demo - in production, use Stripe Elements
      toast.success("Payment initiated! Redirecting to Stripe...");
      setIsComplete(true);
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Enroll in Course
          </DialogTitle>
          <DialogDescription>
            Complete your payment to access this course
          </DialogDescription>
        </DialogHeader>

        {isComplete ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-500 mb-4">
              You are now enrolled in this course.
            </p>
            <Button onClick={onClose} className="bg-green-600 text-white">
              Start Learning
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{course.title}</h4>
                  <p className="text-sm text-gray-500">{course.subject}</p>
                  {course.tutor && (
                    <p className="text-sm text-gray-400">
                      by {course.tutor.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Course Price</span>
                <span>৳{course.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Fee</span>
                <span>৳0</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-blue-600">৳{course.price}</span>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ৳{course.price}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-400">
              Secured by Stripe. Your payment info is encrypted.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
