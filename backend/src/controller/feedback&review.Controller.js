import { receiveFeedbackMail } from "../lib/mail/noodemailer.js";

const isNonEmpty = (value) => {
  return (
    value !== null && value !== undefined && value.toString().trim() !== ""
  );
};

export const receiveFeedbackController = async (req, res) => {
  try {
    const { message } = req.body;
    const userEmail = req.user?.email;

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