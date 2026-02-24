import { Schema, models, model } from "mongoose";

const MessageSchema = new Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AIChatSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

AIChatSchema.index({ student: 1 });
AIChatSchema.index({ subject: 1 });

const AIChat = models.AIChat || model("AIChat", AIChatSchema);
export default AIChat;
