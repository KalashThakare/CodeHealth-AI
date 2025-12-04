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

export const sendAlertNotification = async (userEmail, alertData) => {
  const {
    alertName,
    repoName,
    currentValue,
    threshold,
    operator,
    triggeredAt,
    dashboardLink
  } = alertData;

  // Validate required fields
  if (!userEmail || !alertName || !repoName) {
    throw new Error("User email, alert name, and repo name are required");
  }

  // Format the operator for display
  const operatorText = {
    '<': 'less than',
    '>': 'greater than',
    '<=': 'less than or equal to',
    '>=': 'greater than or equal to',
    '==': 'equal to'
  }[operator] || operator;

  // Format alert name for display
  const alertDisplayName = {
    'healthAlert': 'Health Score',
    'stalePRs': 'Stale Pull Requests',
    'codeQuality': 'Code Quality',
    'highRiskFiles': 'High Risk Files',
    'technicalDebt': 'Technical Debt'
  }[alertName] || alertName;

  // Determine severity color based on alert type
  const getSeverityColor = () => {
    if (operator === '>' || operator === '>=') return '#dc2626'; // red for exceeding thresholds
    if (operator === '<' || operator === '<=') return '#ea580c'; // orange for falling below thresholds
    return '#2563eb'; // blue for equality
  };

  const severityColor = getSeverityColor();
  const timestamp = triggeredAt ? new Date(triggeredAt).toLocaleString() : new Date().toLocaleString();

  const subject = `🚨 Alert Triggered: ${alertDisplayName} - ${repoName}`;

  const text = `Alert Notification

Repository: ${repoName}
Alert Type: ${alertDisplayName}
Current Value: ${currentValue}
Threshold: ${operatorText} ${threshold}
Triggered At: ${timestamp}

${dashboardLink ? `View Dashboard: ${dashboardLink}` : ''}

This alert was triggered because the ${alertDisplayName} (${currentValue}) is ${operatorText} your configured threshold (${threshold}).
`;

  const html = `
    <div style="width:100%; background-color:#ffffff; padding:40px 0; margin:0;">
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111; max-width:600px; margin:0 auto; box-sizing:border-box;">
        <div style="background:${severityColor}; color:#fff; padding:16px 20px; border-radius:8px 8px 0 0;">
          <h2 style="margin:0; font-size:20px;">🚨 Alert Triggered</h2>
        </div>
        
        <div style="border:1px solid #e5e7eb; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
          <div style="background:#f9fafb; padding:16px; border-radius:6px; margin-bottom:20px;">
            <h3 style="margin:0 0 12px 0; font-size:18px; color:#111;">${alertDisplayName}</h3>
            <p style="margin:0; color:#6b7280; font-size:14px;">Repository: <b style="color:#111;">${repoName}</b></p>
          </div>

          <div style="margin-bottom:20px;">
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0; color:#6b7280; width:40%;">Current Value:</td>
                <td style="padding:8px 0; font-weight:600; color:${severityColor};">${currentValue}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280;">Threshold:</td>
                <td style="padding:8px 0; font-weight:600;">${operatorText} ${threshold}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280;">Triggered At:</td>
                <td style="padding:8px 0;">${timestamp}</td>
              </tr>
            </table>
          </div>

          <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:4px; margin-bottom:20px;">
            <p style="margin:0; font-size:14px; color:#92400e;">
              <b>Alert Condition Met:</b> The ${alertDisplayName} (${currentValue}) is ${operatorText} your configured threshold (${threshold}).
            </p>
          </div>

          ${dashboardLink ? `
          <p style="text-align:center; margin:20px 0;">
            <a href="${dashboardLink}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
              View Dashboard
            </a>
          </p>
          <p style="text-align:center; font-size:12px; color:#6b7280; margin:0; overflow-wrap:break-word; word-wrap:break-word;">
            or copy this link: <span style="word-break:break-all; overflow-wrap:break-word;">${dashboardLink}</span>
          </p>
          ` : ''}

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          
          <div style="font-size:12px; color:#6b7280;">
            <p style="margin:0 0 8px 0;">You're receiving this because you configured an alert for this repository.</p>
            <p style="margin:0;">To modify or disable this alert, visit your dashboard settings.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"CodeHealth AI Alerts" <clouddrop.s3@gmail.com>',
    to: userEmail,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};