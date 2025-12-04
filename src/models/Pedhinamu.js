// import mongoose from "mongoose";

// const MemberSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   relation: { type: String, required: true },  // son, daughter, wife, husband, etc.
//   age: String,
//   mobile: String,
//   isDeceased: { type: Boolean, default: false },

//   // Spouse (optional)
//   spouse: {
//     name: String,
//     age: String,
//     isDeceased: { type: Boolean, default: false }
//   },

//   // Children (recursive)
//   children: [
//     {
//       type: mongoose.Schema.Types.Mixed   // recursive schema
//     }
//   ]
// });

// const PedhinamuSchema = new mongoose.Schema(
//   {
//     mukhya: {
//       name: String,
//       age: String,
//       isDeceased: { type: Boolean, default: false },

//       spouse: {
//         name: String,
//         age: String,
//         isDeceased: { type: Boolean, default: false }
//       },

//       children: [MemberSchema]
//     },

//     hasFullForm: { type: Boolean, default: false },
//     isDeleted: { type: Boolean, default: false }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Pedhinamu", PedhinamuSchema);

import mongoose from "mongoose";

/* ======================================================
   GRANDCHILDREN (3rd Level)
====================================================== */
const GrandChildSchema = new mongoose.Schema({
  name: String,
  age: String,
  relation: String,

  dob: String,
  dobDisplay: String,

  isDeceased: { type: Boolean, default: false },
  dod: String,
  dodDisplay: String
});

/* ======================================================
   CHILDREN OF HEIRS (2nd Level)
====================================================== */
const SubChildSchema = new mongoose.Schema({
  name: String,
  age: String,
  relation: String,

  dob: String,
  dobDisplay: String,

  isDeceased: { type: Boolean, default: false },
  dod: String,
  dodDisplay: String,

  // Spouse of this child
  spouse: {
    name: String,
    age: String,
    relation: String,

    dob: String,
    dobDisplay: String,

    isDeceased: { type: Boolean, default: false },
    dod: String,
    dodDisplay: String
  },

  // Grandchildren
  children: [GrandChildSchema]
});

/* ======================================================
   SPOUSE OF HEIR (1st Level spouse)
====================================================== */
const SubSpouseSchema = new mongoose.Schema({
  name: String,
  age: String,
  relation: String,

  dob: String,
  dobDisplay: String,

  isDeceased: { type: Boolean, default: false },
  dod: String,
  dodDisplay: String
});

/* ======================================================
   HEIR'S FAMILY TREE (subFamily)
====================================================== */
const SubFamilySchema = new mongoose.Schema({
  spouse: SubSpouseSchema,
  children: [SubChildSchema]
});

/* ======================================================
   HEIR (1st Level)
====================================================== */
const HeirSchema = new mongoose.Schema({
  name: String,
  relation: String,
  age: String,
  mobile: String,

  dob: String,
  dobDisplay: String,

  isDeceased: { type: Boolean, default: false },
  dod: String,
  dodDisplay: String,

  subFamily: SubFamilySchema
});

/* ======================================================
   MAIN MUKHYA
====================================================== */
const MukhyaSchema = new mongoose.Schema({
  name: String,
  age: String,
  mobile: String,

  dob: String,
  dobDisplay: String,

  isDeceased: { type: Boolean, default: false },
  dod: String,
  dodDisplay: String
});

/* ======================================================
   MAIN PEDHINAMU DOCUMENT
====================================================== */
const PedhinamuSchema = new mongoose.Schema(
  {
    mukhya: MukhyaSchema,
    heirs: [HeirSchema],

    hasFullForm: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Pedhinamu", PedhinamuSchema);
