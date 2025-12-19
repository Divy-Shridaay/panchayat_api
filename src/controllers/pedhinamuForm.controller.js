import Pedhinamu from "../models/Pedhinamu.js";
import PedhinamuFormDetails from "../models/PedhinamuFormDetails.js";

// Create basic Pedhinamu (Alive only)
export const createPedhinamu = async (req, res) => {
  try {
    const data = req.body;

    // remove empty heirs
    data.heirs = data.heirs.filter((h) => h.name && h.relation);

    const saved = await Pedhinamu.create(data);

    return res.json({
      message: "Pedhinamu saved successfully",
      data: saved
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to create Pedhinamu" });
  }
};

// List all Pedhinamu
export const getPedhinamus = async (req, res) => {
  const list = await Pedhinamu.find().sort({ createdAt: -1 });
  res.json(list);
};

// Save full form
export const saveFullForm = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // Debug: Log raw body
    console.log('Raw body.panch:', body.panch);
    console.log('Type:', typeof body.panch);

    // Helper to safely parse JSON strings
    const parseJson = (str) => {
      try {
        return typeof str === 'string' ? JSON.parse(str) : str;
      } catch (e) {
        console.log('Parse error for:', str);
        return str;
      }
    };

    // Build clean updateData object with properly parsed fields
    const updateData = {
      pedhinamuId: id,
      heirType: "alive",

      // Parse all JSON fields
      panch: parseJson(body.panch),
      deceasedPersons: parseJson(body.deceasedPersons),
      heirs: parseJson(body.heirs),
      documents: parseJson(body.documents),

      // Other string/number fields
      applicantName: body.applicantName,
      applicantSurname: body.applicantSurname,
      applicantMobile: body.applicantMobile,
      applicantAadhaar: body.applicantAadhaar,
      applicationDate: body.applicationDate,

      mukhyaName: body.mukhyaName,
      mukhyaAge: body.mukhyaAge,

      notaryName: body.notaryName,
      notaryBookNo: body.notaryBookNo,
      notaryPageNo: body.notaryPageNo,
      notarySerialNo: body.notarySerialNo,
      notaryDate: body.notaryDate,

      referenceNo: body.referenceNo,
      mukkamAddress: body.mukkamAddress,
      jaminSurveyNo: body.jaminSurveyNo,
      jaminKhatano: body.jaminKhatano,
      reasonForPedhinamu: body.reasonForPedhinamu,

      talatiName: body.talatiName,
      varasdarType: body.varasdarType,
      totalHeirsCount: parseInt(body.totalHeirsCount) || 0,
      javadNo: body.javadNo,

      totalDeceasedCount: parseInt(body.totalDeceasedCount) || 0,
    };

    // Handle panch photos
    if (req.files && req.files.length > 0) {
      const panchPhotos = req.files.filter(file => file.fieldname === 'panchPhotos');
      console.log('Panch photos found:', panchPhotos.length);

      // Assign photo paths to corresponding panch
      panchPhotos.forEach((file, index) => {
        if (updateData.panch && updateData.panch[index]) {
          updateData.panch[index].photo = `/uploads/${file.filename}`;
          console.log(`Assigned photo ${file.filename} to panch ${index}`);
        }
      });
    }

    console.log('Final updateData:', JSON.stringify(updateData, null, 2));

    const saved = await PedhinamuFormDetails.findOneAndUpdate(
      { pedhinamuId: id },
      updateData,
      { upsert: true, new: true }
    );

    await Pedhinamu.findByIdAndUpdate(id, { hasFullForm: true });

    res.json({
      message: "Full form saved successfully",
      data: saved
    });
  } catch (err) {
    console.log('SAVE FULLFORM ERROR:', err);
    res.status(500).json({ error: "Failed to save form" });
  }
};

// Get full details
export const getFullPedhinamu = async (req, res) => {
  try {
    const { id } = req.params;

    const pedhinamu = await Pedhinamu.findById(id);
    const form = await PedhinamuFormDetails.findOne({ pedhinamuId: id });

    res.json({ pedhinamu, form });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to get pedhinamu" });
  }
};
