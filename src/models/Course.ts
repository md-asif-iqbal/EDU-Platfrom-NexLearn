import { Schema, models, model } from "mongoose";

const LessonSchema = new Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
});

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: [
        "Math",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "Bengali",
        "Programming",
        "Business",
      ],
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: ["School", "College", "University"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    lessons: [LessonSchema],
    syllabus: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CourseSchema.index({ subject: 1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ tutor: 1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ rating: -1 });
CourseSchema.index({ title: "text", description: "text" });

const Course = models.Course || model("Course", CourseSchema);
export default Course;
