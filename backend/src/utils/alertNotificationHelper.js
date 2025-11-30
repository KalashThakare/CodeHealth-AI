import notification from "../database/models/notification.js";

export const createAlertNotification = async (userId, title, message) => {
  try {
    await notification.create({
      userId: userId,
      title: title,
      message: message,
      is_read: false,
      alert: true
    });
    console.log(`Alert notification created: ${title}`);
    return true;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return false;
  }
};