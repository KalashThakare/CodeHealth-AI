import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAlert, getNotifications, markAllRead, markRead } from "../controller/notification.Controller.js";

const router = express.Router()

router.get('/notifications', protectRoute, getNotifications);
router.patch('/notifications/:notificationId/read', protectRoute, markRead);
router.patch('/notifications/read-all', protectRoute, markAllRead);

router.get("/alerts", protectRoute, getAlert);

export default router;