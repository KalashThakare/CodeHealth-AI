import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteAll, deleteNotification, getAlert, getNotifications, markAllRead, markRead } from "../controller/notification.Controller.js";

const router = express.Router()

router.get('/get', protectRoute, getNotifications);
router.patch('/:notificationId/read', protectRoute, markRead);
router.patch('/read-all', protectRoute, markAllRead);
router.delete('/:notificationId/delete', protectRoute, deleteNotification);
router.delete("/deleteall", protectRoute, deleteAll);

router.get("/alerts", protectRoute, getAlert);

export default router;