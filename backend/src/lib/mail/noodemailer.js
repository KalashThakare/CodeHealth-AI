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