import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "clouddrop.s3@gmail.com",
        pass: process.env.NODEMAILER_PASSKEY
    }
})

export const sendInviteMail = async (email, role, inviteLink) => {
    const mailOptions = {
        from: '"CodeHealth AI" <clouddrop.s3@gmail.com>',
        to: email,
        subject: `You’ve been invited as ${role} to join a team`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2>Team Invitation</h2>
        <p>You’ve been invited to join a team as <b>${role}</b>.</p>
        <p>Click the button below to accept the invite:</p>
        <p>
          <a href="${inviteLink}" style="display:inline-block;background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">
            Accept Invitation
          </a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all;">${inviteLink}</p>
        <hr/>
        <small>This invite link will expire in 7 days. If you didn’t expect this invite, you can ignore this email.</small>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

export const receiveFeedbackMail = async (userEmail, message) => {

  const TEAM_INBOX = "clouddrop.s3@gmail.com"; 

  const safeUser = typeof userEmail === "string" ? userEmail.trim() : "";
  const safeMsg = typeof message === "string" ? message.trim() : "";

  if (!safeUser) throw new Error("User email is required");
  if (!safeMsg) throw new Error("Feedback message is required");

  const subject = "New user feedback";

  const text = `New feedback received

From: ${safeUser}

${safeMsg}
`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111;">
      <h3 style="margin:0 0 8px 0;">New feedback received</h3>
      <p><b>From:</b> ${safeUser}</p>
      <p style="white-space:pre-wrap">${safeMsg.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
      <small style="color:#6b7280;">Reply directly to reach the user.</small>
    </div>
  `;

  const mailOptions = {
    from: '"CodeHealth AI" <clouddrop.s3@gmail.com>', 
    to: TEAM_INBOX,                                  
    subject,
    text,
    html,
    replyTo: safeUser,                             
  };

  await transporter.sendMail(mailOptions);
};
