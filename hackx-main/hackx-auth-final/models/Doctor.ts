import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDoctor extends Document {
  email: string;
  passwordHash: string;
  name: string;
  specialization: string;
  hospital: string;
  role: "doctor";
  createdAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    email:          { type: String, required: true, unique: true },
    passwordHash:   { type: String, required: true },
    name:           { type: String, required: true },
    specialization: { type: String, default: "General Physician" },
    hospital:       { type: String, default: "Nabha Civil Hospital" },
    role:           { type: String, default: "doctor" },
  },
  { timestamps: true }
);

const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;
