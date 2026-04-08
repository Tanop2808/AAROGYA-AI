import mongoose, { Schema, Document, Model } from "mongoose";

// ── ASHA Worker ───────────────────────────────────────────
export interface IASHAWorker extends Document {
  phone:    string;
  name:     string;
  password: string;       // added for real auth
  villages: string[];
  role:     "ashaworker";
  createdAt: Date;
}

const ASHAWorkerSchema = new Schema<IASHAWorker>(
  {
    phone:    { type: String, required: true, unique: true },
    name:     { type: String, required: true },
    password: { type: String, required: true },
    villages: { type: [String], default: [] },
    role:     { type: String, default: "ashaworker" },
  },
  { timestamps: true }
);

export const ASHAWorker: Model<IASHAWorker> =
  mongoose.models.ASHAWorker || mongoose.model<IASHAWorker>("ASHAWorker", ASHAWorkerSchema);

// ── ASHA Visit ────────────────────────────────────────────
export interface IASHAVisit extends Document {
  ashaWorkerPhone: string;
  patientPhone:    string;
  patientName:     string;
  visitDate:       string;
  notes:           string;
  appLearned:      boolean;
  createdAt:       Date;
}

const ASHAVisitSchema = new Schema<IASHAVisit>(
  {
    ashaWorkerPhone: { type: String, required: true, index: true },
    patientPhone:    { type: String, required: true },
    patientName:     { type: String, required: true },
    visitDate:       { type: String, required: true },
    notes:           { type: String, default: "" },
    appLearned:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ASHAVisit: Model<IASHAVisit> =
  mongoose.models.ASHAVisit || mongoose.model<IASHAVisit>("ASHAVisit", ASHAVisitSchema);

// ── SOS Alert ─────────────────────────────────────────────
export interface ISOSAlert extends Document {
  ashaWorkerPhone: string;
  ashaWorkerName:  string;
  village:         string;
  description:     string;
  affectedCount:   number;
  status:          "active" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  doctorNotes?:    string;
  createdAt:       Date;
}

const SOSAlertSchema = new Schema<ISOSAlert>(
  {
    ashaWorkerPhone: { type: String, required: true },
    ashaWorkerName:  { type: String, required: true },
    village:         { type: String, required: true },
    description:     { type: String, required: true },
    affectedCount:   { type: Number, required: true },
    status:          { type: String, enum: ["active", "acknowledged", "resolved"], default: "active" },
    acknowledgedBy:  { type: String },
    doctorNotes:     { type: String, default: "" },
  },
  { timestamps: true }
);

export const SOSAlert: Model<ISOSAlert> =
  mongoose.models.SOSAlert || mongoose.model<ISOSAlert>("SOSAlert", SOSAlertSchema);

// ── Pharmacy (public listing) ──────────────────────────────
export interface IPharmacy extends Document {
  name:      string;
  village:   string;
  district:  string;
  phone:     string;
  lat:       number;
  lng:       number;
  medicines: Array<{ name: string; qty: number; inStock: boolean }>;
}

const PharmacySchema = new Schema<IPharmacy>({
  name:     { type: String, required: true },
  village:  { type: String, required: true },
  district: { type: String, default: "Nabha" },
  phone:    { type: String, required: true },
  lat:      { type: Number, required: true },
  lng:      { type: Number, required: true },
  medicines: [{ name: String, qty: Number, inStock: Boolean }],
});

export const Pharmacy: Model<IPharmacy> =
  mongoose.models.Pharmacy || mongoose.model<IPharmacy>("Pharmacy", PharmacySchema);

// ── Pharmacist (store owner account) ─────────────────────
export interface IPharmacist extends Document {
  phone:         string;
  password:      string;       // added for real auth
  name:          string;
  email?:        string;
  ownerAge?:     string;
  qualification?: string;
  storeName:     string;
  village:       string;
  district:      string;
  address:       string;
  licenseNumber: string;
  distanceKm:    string;
  type:          "Govt Free" | "Jan Aushadhi" | "Private";
  stock: Array<{
    medicineName: string;
    qty:          number;
    minRequired:  number;
    price:        string;
    inStock:      boolean;
  }>;
  isVerified: boolean;
  createdAt:  Date;
  updatedAt:  Date;
}

const PharmacistSchema = new Schema<IPharmacist>(
  {
    phone:         { type: String, required: true, unique: true, index: true },
    password:      { type: String, required: true },
    name:          { type: String, required: true },
    email:         { type: String, default: "" },
    ownerAge:      { type: String, default: "" },
    qualification: { type: String, default: "" },
    storeName:     { type: String, required: true },
    village:       { type: String, required: true },
    district:      { type: String, default: "Nabha" },
    address:       { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    distanceKm:    { type: String, default: "0" },
    type:          { type: String, enum: ["Govt Free", "Jan Aushadhi", "Private"], default: "Private" },
    stock: [
      {
        medicineName: { type: String, required: true },
        qty:          { type: Number, default: 0 },
        minRequired:  { type: Number, default: 30 },
        price:        { type: String, default: "Ask at counter" },
        inStock:      { type: Boolean, default: false },
      },
    ],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Pharmacist: Model<IPharmacist> =
  mongoose.models.Pharmacist || mongoose.model<IPharmacist>("Pharmacist", PharmacistSchema);
