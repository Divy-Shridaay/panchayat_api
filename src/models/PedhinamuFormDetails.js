import mongoose from "mongoose";

const PedhinamuFormDetailsSchema = new mongoose.Schema(
  {
    pedhinamuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pedhinamu",
      required: true
    },

    // ------------------------ Applicant ------------------------
    applicantName: String,
    applicantSurname: String,
    applicantMobile: String,
    applicantAadhaar: String,
    applicationDate: String,

    // ------------------------ Deceased ------------------------
    deceasedPersonName: String,
    deceasedPersonDate: String,
    deceasedPersonAge: String,
    mukhyaIsDeceased: { type: Boolean, default: false },

    // ------------------------ Notary ------------------------
    notaryName: String,
    notaryBookNo: String,
    notaryPageNo: String,
    notarySerialNo: String,
    notaryDate: String,

    // ------------------------ Purpose ------------------------
    referenceNo: String,
    mukkamAddress: String,
    jaminSurveyNo: String,
    jaminKhatano: String,
    reasonForPedhinamu: String,

    // ------------------------ Panch List ------------------------
    deceasedPersons: [
  {
    name: String,
    age: String,
    date: String
  }
],
    panch: [
      {
        name: String,
        age: String,
        occupation: String,
        aadhaar: String,
        mobile: String,
        photo: String // Photo path/URL
      }
    ],

    // ------------------------ Documents ------------------------
    documents: {
      affidavit: { type: Boolean, default: false },
      satbara: { type: Boolean, default: false },
      aadhaarCopy: { type: Boolean, default: false },
      govtForm: { type: Boolean, default: false },
      deathCertificate: { type: Boolean, default: false },
      panchResolution: { type: Boolean, default: false },
      panchWitness: { type: Boolean, default: false },
      otherDocument: { type: String, default: "" }
    },

    // ------------------------ Talati Section ------------------------
    talatiName: String,
    varasdarType: String, // alive/deceased
    totalHeirsCount: Number,
    javadNo: String,

    heirType: { type: String, default: "alive" },
    isDeleted: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);

export default mongoose.model(
  "PedhinamuFormDetails",
  PedhinamuFormDetailsSchema
);
