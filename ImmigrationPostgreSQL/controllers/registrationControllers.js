// controllers/registrationControllers.js

const prisma = require("../lib/prisma");
const moment = require("moment");

//
// ─── GENERATE WORK PERMIT ID ─────────────────────────────────────────────────────
//
const generateWorkPermitID = () => {
  return `WP${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

//
// ─── GET ALL REGISTER DETAILS ────────────────────────────────────────────────────
//
exports.getAllRegisterDetails = async (req, res) => {
  try {
    const registerDetails = await prisma.registerDetails.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Convert BigInt → string for JSON
    const serializedData = registerDetails.map((item) => ({
      id: item.id,
      employeename: item.employeename ?? null,
      mycid: item.mycid?.toString() ?? null,
      date: item.date ?? null,
      employername: item.employername ?? null,
      Workpermit: item.Workpermit ?? null,
      createdAt: item.createdAt,
    }));

    return res.status(200).json({
      status: "success",
      count: serializedData.length,
      data: serializedData,
    });
  } catch (err) {
    console.error("Error fetching all register details:", err);
    return res.status(500).json({ status: "error", error: err.message });
  }
};

//
// ─── CREATE REGISTER DETAILS ─────────────────────────
//
exports.createRegisterDetails = async (req, res) => {
  try {
    // Destructure whatever came in the request body:
    //   If a key wasn't sent, it will be undefined.
    const { employeename, cid, date, employername, Workpermit } = req.body;
    console.log("⋅⋅[createRegisterDetails] incoming body:", req.body);

    // Build the data object for Prisma. Only include keys if they are defined.
    const registrationData = {};

    if (typeof employeename !== "undefined") {
      registrationData.employeename = employeename;
    }

    if (typeof cid !== "undefined") {
      // Attempt to convert to BigInt; if invalid, it will throw and be caught below
      registrationData.mycid = BigInt(cid);
    }

    // For `date`, if the client gave one, use it; otherwise default to today's date string.
    registrationData.date =
      typeof date !== "undefined" ? date : moment().format("YYYY-MM-DD");

    if (typeof employername !== "undefined") {
      registrationData.employername = employername;
    }

    // Generate Work Permit ID automatically
    // If client provided one, use it; otherwise generate new one
    registrationData.Workpermit = 
      typeof Workpermit !== "undefined" && Workpermit !== null && Workpermit.trim() !== ""
        ? Workpermit 
        : generateWorkPermitID();

    console.log("⋅⋅[createRegisterDetails] data to write:", registrationData);

    // Insert into the database. Prisma will throw if a non-nullable column is missing,
    // or if types don't line up (e.g., mycid not a valid BigInt), or if unique constraint fails.
    const newRecord = await prisma.registerDetails.create({
      data: registrationData,
    });

    console.log("⋅⋅[createRegisterDetails] saved to DB:", newRecord);

    // Convert any BigInt → string for the JSON response
    const responseData = {
      id: newRecord.id,
      employeename: newRecord.employeename ?? null,
      mycid: newRecord.mycid?.toString() ?? null,
      date: newRecord.date ?? null,
      employername: newRecord.employername ?? null,
      Workpermit: newRecord.Workpermit ?? null,
      createdAt: newRecord.createdAt,
    };

    return res.status(201).json({
      status: "success",
      data: responseData,
    });
  } catch (err) {
    console.error("‼️ [createRegisterDetails] Error:", err);

    // If prisma throws a unique‐constraint violation on mycid:
    if (err.code === "P2002" && err.meta?.target?.includes("mycid")) {
      return res.status(400).json({
        status: "error",
        error: "Registration already exists for this CID",
      });
    }

    // If prisma throws a unique‐constraint violation on Workpermit:
    if (err.code === "P2002" && err.meta?.target?.includes("Workpermit")) {
      return res.status(400).json({
        status: "error",
        error: "Work permit ID already exists",
      });
    }

    // If BigInt(cid) blew up because cid was invalid:
    if (err instanceof TypeError && err.message.match(/Cannot convert/)) {
      return res
        .status(400)
        .json({ status: "error", error: "Invalid CID format" });
    }

    // Any other unexpected error:
    return res.status(500).json({ status: "error", error: err.message });
  }
};

//
// ─── GET A SINGLE REGISTER DETAIL BY ID, CID, OR WORK PERMIT ─────────────────────
//
exports.getRegisterDetails = async (req, res) => {
  try {
    const { ref_uuid } = req.params;
    const conditions = [];

    // If ref_uuid is an integer string, treat as `id`.
    const maybeId = parseInt(ref_uuid, 10);
    if (!isNaN(maybeId)) {
      conditions.push({ id: maybeId });
    }

    // If ref_uuid can be coerced to BigInt, treat as `mycid`.
    // (If it's invalid BigInt, skip it.)
    try {
      const maybeCid = BigInt(ref_uuid);
      conditions.push({ mycid: maybeCid });
    } catch (e) {
      // ignore invalid BigInt
    }

    // NEW: Check if ref_uuid looks like a Work Permit ID (starts with "WP")
    if (ref_uuid && typeof ref_uuid === 'string' && ref_uuid.startsWith('WP')) {
      conditions.push({ Workpermit: ref_uuid });
    }

    // ALTERNATIVE: You could also just always check for Workpermit as a string
    // conditions.push({ Workpermit: ref_uuid });

    if (conditions.length === 0) {
      return res.status(400).json({
        status: "error",
        error: "ref_uuid must be a numeric ID, valid CID string, or Work Permit ID",
      });
    }

    const registerDetails = await prisma.registerDetails.findMany({
      where: { OR: conditions },
    });

    if (registerDetails.length === 0) {
      return res.status(404).json({
        status: "error",
        error: "Registration details not found",
      });
    }

    // Convert BigInt → string
    const filteredDetails = registerDetails.map((details) => ({
      id: details.id,
      employeename: details.employeename ?? null,
      mycid: details.mycid?.toString() ?? null,
      date: details.date ?? null,
      employername: details.employername ?? null,
      Workpermit: details.Workpermit ?? null,
      createdAt: details.createdAt,
    }));

    return res.status(200).json({ status: "success", data: filteredDetails });
  } catch (err) {
    console.error("Error fetching register details:", err);
    return res.status(500).json({ status: "error", error: err.message });
  }
};

//
// ─── UPDATE REGISTER DETAILS ─────────────────────────────────────────────────────
//
exports.updateRegisterDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updateBody = { ...req.body };

    // Don't allow overriding id or createdAt
    delete updateBody.id;
    delete updateBody.createdAt;

    // If client sends `cid`, convert → mycid BigInt, then remove `cid`
    if (typeof updateBody.cid !== "undefined") {
      updateBody.mycid = BigInt(updateBody.cid);
      delete updateBody.cid;
    }

    // Build prismaPayload only for the keys that exist in updateBody
    const prismaPayload = {};
    if (typeof updateBody.employeename !== "undefined") {
      prismaPayload.employeename = updateBody.employeename;
    }
    if (typeof updateBody.mycid !== "undefined") {
      prismaPayload.mycid = updateBody.mycid;
    }
    if (typeof updateBody.date !== "undefined") {
      prismaPayload.date = updateBody.date;
    }
    if (typeof updateBody.employername !== "undefined") {
      prismaPayload.employername = updateBody.employername;
    }
    if (typeof updateBody.Workpermit !== "undefined") {
      prismaPayload.Workpermit = updateBody.Workpermit;
    }

    const updatedRecord = await prisma.registerDetails.update({
      where: { id: Number(id) },
      data: prismaPayload,
    });

    // Convert BigInt → string
    const responseData = {
      id: updatedRecord.id,
      employeename: updatedRecord.employeename ?? null,
      mycid: updatedRecord.mycid?.toString() ?? null,
      date: updatedRecord.date ?? null,
      employername: updatedRecord.employername ?? null,
      Workpermit: updatedRecord.Workpermit ?? null,
      createdAt: updatedRecord.createdAt,
    };

    return res.status(200).json({
      status: "success",
      data: responseData,
    });
  } catch (err) {
    console.error("Error updating register details:", err);

    // If not found
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "error",
        error: "Registration details not found",
      });
    }

    // If unique‐constraint on mycid
    if (err.code === "P2002" && err.meta?.target?.includes("mycid")) {
      return res.status(400).json({
        status: "error",
        error: "CID already exists for another registration",
      });
    }

    // If unique‐constraint on Workpermit
    if (err.code === "P2002" && err.meta?.target?.includes("Workpermit")) {
      return res.status(400).json({
        status: "error",
        error: "Work permit ID already exists",
      });
    }

    // If BigInt failed
    if (err instanceof TypeError && err.message.match(/Cannot convert/)) {
      return res
        .status(400)
        .json({ status: "error", error: "Invalid CID format" });
    }

    return res.status(500).json({ status: "error", error: err.message });
  }
};

//
// ─── DELETE REGISTER DETAILS ─────────────────────────────────────────────────────
//
exports.deleteRegisterDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecord = await prisma.registerDetails.delete({
      where: { id: Number(id) },
    });

    const responseData = {
      id: deletedRecord.id,
      employeename: deletedRecord.employeename ?? null,
      mycid: deletedRecord.mycid?.toString() ?? null,
      date: deletedRecord.date ?? null,
      employername: deletedRecord.employername ?? null,
      Workpermit: deletedRecord.Workpermit ?? null,
      createdAt: deletedRecord.createdAt,
    };

    return res.status(200).json({
      status: "success",
      data: responseData,
      message: "Registration details deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting register details:", err);

    if (err.code === "P2025") {
      return res.status(404).json({
        status: "error",
        error: "Registration details not found",
      });
    }

    return res.status(500).json({ status: "error", error: err.message });
  }
};