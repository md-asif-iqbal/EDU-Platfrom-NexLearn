import { Schema, models, model } from "mongoose";

const PaymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "bdt",
      enum: ["bdt", "usd"],
    },
    stripePaymentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ user: 1 });
PaymentSchema.index({ course: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ stripePaymentId: 1 });

const Payment = models.Payment || model("Payment", PaymentSchema);
export default Payment;
