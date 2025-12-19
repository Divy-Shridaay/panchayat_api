import Pedhinamu from "../models/Pedhinamu.js";
import PedhinamuFormDetails from "../models/PedhinamuFormDetails.js";

/* ============================================================
    1. CREATE BASIC PEDHINAMU (supports subFamily)
   ============================================================ */
export const createPedhinamu = async (req, res) => {
  try {
    const d = req.body;

    if (!d.mukhya || !d.mukhya.name) {
      return res.status(400).json({ error: "Mukhya name is required" });
    }

    const data = {
      mukhya: {
        name: d.mukhya.name,
        age: d.mukhya.age,
        dob: d.mukhya.dob || "",
        dobDisplay: d.mukhya.dobDisplay || "",
        isDeceased: d.mukhya.isDeceased || false,
        dod: d.mukhya.dod || "",
        dodDisplay: d.mukhya.dodDisplay || "",
        mobile: d.mukhya.mobile || ""
      },

      heirs: (d.heirs || [])
        .filter(h => h.name?.trim())
        .map(h => ({
          name: h.name || "",
          relation: h.relation || "",
          age: h.age || "",
          dob: h.dob || "",
          dobDisplay: h.dobDisplay || "",
          mobile: h.mobile || "",
          isDeceased: h.isDeceased || false,
          dod: h.isDeceased ? (h.dod || "") : "",
          dodDisplay: h.isDeceased ? (h.dodDisplay || "") : "",

          subFamily: {
            spouse: {
              name: h.subFamily?.spouse?.name || "",
              age: h.subFamily?.spouse?.age || "",
              relation: h.subFamily?.spouse?.relation || "",
              relation2: h.subFamily?.spouse?.relation2 || "",
              dob: h.subFamily?.spouse?.dob || "",
              dobDisplay: h.subFamily?.spouse?.dobDisplay || "",
              isDeceased: h.subFamily?.spouse?.isDeceased || false,
              dod: h.subFamily?.spouse?.isDeceased ? (h.subFamily?.spouse?.dod || "") : "",
              dodDisplay: h.subFamily?.spouse?.isDeceased ? (h.subFamily?.spouse?.dodDisplay || "") : "",
            },

            children: (h.subFamily?.children || []).map(c => ({
              name: c.name || "",
              age: c.age || "",
              relation: c.relation || "",
              dob: c.dob || "",
              dobDisplay: c.dobDisplay || "",
              isDeceased: c.isDeceased || false,
              dod: c.isDeceased ? (c.dod || "") : "",
              dodDisplay: c.isDeceased ? (c.dodDisplay || "") : "",

              spouse: {
                name: c.spouse?.name || "",
                age: c.spouse?.age || "",
                relation: c.spouse?.relation || "",
                dob: c.spouse?.dob || "",
                dobDisplay: c.spouse?.dobDisplay || "",
                isDeceased: c.spouse?.isDeceased || false,
                dod: c.spouse?.isDeceased ? (c.spouse?.dod || "") : "",
                dodDisplay: c.spouse?.isDeceased ? (c.spouse?.dodDisplay || "") : "",
              },

              children: (c.children || []).map(gc => ({
                name: gc.name || "",
                age: gc.age || "",
                relation: gc.relation || "",
                dob: gc.dob || "",
                dobDisplay: gc.dobDisplay || "",
                isDeceased: gc.isDeceased || false,
                dod: gc.isDeceased ? (gc.dod || "") : "",
                dodDisplay: gc.isDeceased ? (gc.dodDisplay || "") : "",
              }))
            }))
          }
        }))
    };

    const saved = await Pedhinamu.create(data);

    res.json({
      success: true,
      message: "Pedhinamu saved successfully",
      data: saved
    });

  } catch (err) {
    console.log("PEDHINAMU SAVE ERROR:", err);
    res.status(500).json({ error: "Failed to save pedhinamu" });
  }
};



/* ============================================================
    2. PAGINATED LIST OF PEDHINAMU
   ============================================================ */
export const getPedhinamus = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    const total = await Pedhinamu.countDocuments(filter);
    let totalPages = Math.ceil(total / limit);
    if (totalPages < 1) totalPages = 1;
    if (page > totalPages) page = totalPages;

    const data = await Pedhinamu.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data
    });

  } catch (err) {
    console.log("GET LIST ERROR:", err);
    res.status(500).json({ error: "Failed to load records" });
  }
};


/* ============================================================
    3. SAVE FULL FORM (after basic pedhinamu)
    ⚠️ HANDLES FORMDATA WITH FILE UPLOADS
   ============================================================ */
export const saveFullForm = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // console.log('=== FORM DATA RECEIVED ===');
    // console.log('Raw panch:', body.panch);
    // console.log('Files:', req.files?.length || 0);

    // Helper function to safely parse JSON strings from FormData
    const parseJson = (value) => {
      if (!value) return undefined;
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error('JSON parse error:', e.message);
          return undefined;
        }
      }
      return value;
    };

    // Parse all JSON fields that come as strings from FormData
    const panch = parseJson(body.panch);
    const deceasedPersons = parseJson(body.deceasedPersons);
    const heirs = parseJson(body.heirs);
    const documents = parseJson(body.documents);

    // Validate panch array
    if (!Array.isArray(panch)) {
      console.error('❌ Panch is not an array:', typeof panch);
      return res.status(400).json({ 
        error: "Invalid panch data format",
        received: typeof panch,
        value: panch
      });
    }

    

    // Handle panch photos - assign to corresponding panch members
    if (req.files && req.files.length > 0) {
      const panchPhotos = req.files.filter(f => f.fieldname === 'panchPhotos');
      console.log(`📷 Processing ${panchPhotos.length} panch photos`);

      panchPhotos.forEach((file, index) => {
        if (panch[index]) {
          panch[index].photo = `/uploads/${file.filename}`;
          console.log(`✅ Photo assigned to panch ${index}: ${file.filename}`);
        }
      });
    }

    // Build the clean update object
    const updateData = {
      pedhinamuId: id,
      heirType: "alive",

      // Parsed complex fields
      panch: panch,
      deceasedPersons: deceasedPersons || [],
      heirs: heirs || [],
      documents: documents || {},

      // Simple string/number fields
      applicantName: body.applicantName || "",
      applicantSurname: body.applicantSurname || "",
      applicantMobile: body.applicantMobile || "",
      applicantAadhaar: body.applicantAadhaar || "",
      applicationDate: body.applicationDate || "",

      mukhyaName: body.mukhyaName || "",
      mukhyaAge: body.mukhyaAge || "",

      notaryName: body.notaryName || "",
      notaryBookNo: body.notaryBookNo || "",
      notaryPageNo: body.notaryPageNo || "",
      notarySerialNo: body.notarySerialNo || "",
      notaryDate: body.notaryDate || "",

      referenceNo: body.referenceNo || "",
      mukkamAddress: body.mukkamAddress || "",
      jaminSurveyNo: body.jaminSurveyNo || "",
      jaminKhatano: body.jaminKhatano || "",
      reasonForPedhinamu: body.reasonForPedhinamu || "",

      talatiName: body.talatiName || "",
      varasdarType: body.varasdarType || "alive",
      totalHeirsCount: parseInt(body.totalHeirsCount) || 0,
      javadNo: body.javadNo || "",

      totalDeceasedCount: parseInt(body.totalDeceasedCount) || 0,
    };

    

    const saved = await PedhinamuFormDetails.findOneAndUpdate(
      { pedhinamuId: id },
      updateData,
      { upsert: true, new: true }
    );

    await Pedhinamu.findByIdAndUpdate(id, { hasFullForm: true });

    

    res.json({
      success: true,
      message: "Full form saved successfully",
      data: saved
    });

  } catch (err) {
    console.error("❌ SAVE FULLFORM ERROR:", err);
    res.status(500).json({ 
      error: "Failed to save full form",
      details: err.message 
    });
  }
};


/* ============================================================
    4. GET FULL PEDHINAMU (Basic + Form)
   ============================================================ */
export const getFullPedhinamu = async (req, res) => {
  try {
    const { id } = req.params;

    const pedhinamu = await Pedhinamu.findById(id);
    const form = await PedhinamuFormDetails.findOne({ pedhinamuId: id });

    res.json({
      success: true,
      pedhinamu,
      form
    });

  } catch (err) {
    console.log("GET FULL ERROR:", err);
    res.status(500).json({ error: "Failed to get pedhinamu" });
  }
};


/* ============================================================
    5. UPDATE PEDHINAMU TREE (mukhya + heirs)
   ============================================================ */
export const updatePedhinamuTree = async (req, res) => {
  try {
    const { id } = req.params;
    const { mukhya, heirs } = req.body;

    if (!mukhya || !mukhya.name) {
      return res.status(400).json({ error: "Mukhya is required" });
    }

    const cleanedHeirs = (heirs || []).filter(h => h.name?.trim());

    const updated = await Pedhinamu.findByIdAndUpdate(
      id,
      {
        mukhya,
        heirs: cleanedHeirs
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Pedhinamu updated successfully",
      data: updated
    });

  } catch (err) {
    console.log("UPDATE TREE ERROR:", err);
    res.status(500).json({ error: "Failed to update Pedhinamu" });
  }
};



/* ============================================================
    6. SOFT DELETE
   ============================================================ */
export const softDeletePedhinamu = async (req, res) => {
  try {
    const { id } = req.params;

    await Pedhinamu.findByIdAndUpdate(id, { isDeleted: true });
    await PedhinamuFormDetails.findOneAndUpdate(
      { pedhinamuId: id },
      { isDeleted: true }
    );

    res.json({ success: true, message: "Deleted successfully" });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
};