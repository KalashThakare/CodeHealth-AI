import cron from "node-cron";
import notification from "../database/models/notification.js"
import { Op } from "sequelize";

async function notif_cleanUp(){
    console.log("Notification cleanUp job started")
    try {

        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

        await notification.destroy({
            where:{
                is_read:true,
                createdAt: {
                    [Op.lt]: fiveDaysAgo
                }
            }
        });

        console.log("Notifications cleanUp finished");
        
    } catch (error) {
        console.error(error)
    }
}

export const notificationCleanUp = cron.schedule("0 0 * * *", async() =>{
    await notif_cleanUp()
}, {
  scheduled: false,
  timezone: "UTC"
})