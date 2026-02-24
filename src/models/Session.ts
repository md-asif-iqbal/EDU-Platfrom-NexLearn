import { Schema, models, model } from "mongoose";

const SessionSchema = new Schema(
  {
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
      min: [15, "Minimum session duration is 15 minutes"],
      max: [180, "Maximum session duration is 180 minutes"],
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "cancelled"],
      default: "upcoming",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

SessionSchema.index({ tutor: 1 });
SessionSchema.index({ student: 1 });
SessionSchema.index({ scheduledAt: 1 });
SessionSchema.index({ status: 1 });

const Session = models.Session || model("Session", SessionSchema);
export default Session;
