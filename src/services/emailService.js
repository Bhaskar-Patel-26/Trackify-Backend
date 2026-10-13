import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "info@thinkandcode.in";

if (!SENDGRID_API_KEY) {
  console.warn(
    "Warning: SENDGRID_API_KEY is not set. Email functionality will not work."
  );
  throw new Error("Missing SENDGRID_API_KEY is not set");
}

sgMail.setApiKey(SENDGRID_API_KEY);

export const sendTemplateEmail = async ({ to, templateId, dynamicTemplateData, replyTo }) => {
  const msg = {
    to,
    from: FROM_EMAIL,
    templateId,
    dynamic_template_data: dynamicTemplateData,
    replyTo: replyTo || FROM_EMAIL,
  };
  return sgMail.send(msg);
};

export async function sendProjectMemberEmail({ to, inviterName, projectName, projectUrl }) {
  return sendTemplateEmail({
    to,
    templateId: process.env.SENDGRID_TEMPLATE_PROJECT_MEMBER,
    dynamicTemplateData: { inviterName, projectName, projectUrl },
  });
}

export async function sendProjectMemberRemoveEmail({ to, inviterName, projectName, projectUrl }) {
  return sendTemplateEmail({
    to,
    templateId: process.env.SENDGRID_TEMPLATE_PROJECT_MEMBER_REMOVE,
    dynamicTemplateData: { inviterName, projectName, projectUrl },
  });
}

export async function sendIssueAssignedEmail({ to, assigneeName, issueTitle, projectName, issueUrl }) {
  return sendTemplateEmail({
    to,
    templateId: process.env.SENDGRID_TEMPLATE_ISSUE_ASSIGNED,
    dynamicTemplateData: { assigneeName, issueTitle, projectName, issueUrl },
  });
}


export async function sendCommentNotificationEmail({ to, commenterName, commentText, issueTitle, issueUrl }) {
  return sendTemplateEmail({
    to,
    templateId: process.env.SENDGRID_TEMPLATE_COMMENT,
    dynamicTemplateData: { commenterName, commentText, issueTitle, issueUrl },
  });
}