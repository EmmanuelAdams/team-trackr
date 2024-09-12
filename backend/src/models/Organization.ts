import { model, Schema, Document, Types } from 'mongoose';

export interface OrganizationDocument extends Document {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  industryType: string;
  taxId?: string;
  numberOfEmployees?: number;
  employees?: Types.Array<Types.ObjectId>;
  userType: 'Organization';
  createdAt: Date;
}

const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    organizationName: { type: String, required: true },
    industryType: { type: String, required: true },
    taxId: { type: String },
    numberOfEmployees: { type: Number },
    employees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    userType: {
      type: String,
      enum: ['Organization'],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  }
);

export const Organization = model<OrganizationDocument>(
  'Organization',
  OrganizationSchema
);
