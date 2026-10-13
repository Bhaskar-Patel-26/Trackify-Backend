import prisma from "../config/db.js";

export const uploadAttachments = async (req, res) => {
  try {
    const issueId = req.params.issueId || req.params.id;
    const { userId } = req.body; // Assuming userId is sent in the body

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const attachments = [];
    for (const file of req.files) {
      const attachment = await prisma.attachment.create({
        data: {
          fileUrl: file.path,
          fileType: file.mimetype,
          issueId: issueId,
          uploadedBy: userId,
        },
      });
      attachments.push(attachment);
    }
    res.status(201).json(attachments);
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
  }
};

export const listAttachments = async (req, res) => {
  try {
    const issueId = req.params.issueId || req.params.id;
    const attachments = await prisma.attachment.findMany({
      where: { issueId },
    });
    res.status(200).json(attachments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
};

export const removeAttachment = async (req, res, next) => {
  try {
    const { attachmentId } = req.params;
    await prisma.attachment.delete({ where: { id: attachmentId } });
    res.json({ message: "Attachment deleted" });
  } catch (err) {
    next(err);
  }
};
