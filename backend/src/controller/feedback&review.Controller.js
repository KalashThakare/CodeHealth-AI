import { receiveFeedbackMail } from "../lib/mail/noodemailer.js";

export const receiveFeedbackController = async (req, res) => {
  try {
    const { userEmail, message } = req.body;

    if (!isNonEmpty(userEmail)) {
      return res.status(400).json({ error: "userEmail is required" });
    }
    if (!isNonEmpty(message)) {
      return res.status(400).json({ error: "message is required" });
    }

    await receiveFeedbackMail(userEmail, message);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("receiveFeedbackController error:", err);
    return res.status(500).json({ error: "Failed to send feedback" });
  }
};