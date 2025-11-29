import notification from "../database/models/notification.js";

export const getNotifications = async(req, res)=>{
    try {
        const userId = req.user?.userId
        if(!userId){
            return res.status(400).json({message:"Unauthorised"});
        }

        const notifications = await notification.findAll({
            where:{
                userId:userId,
                is_read:false
            },
            order: [['createdAt', 'DESC']]
        })

        return res.status(200).json({
            message:"Success", 
            success:true,
            notifications,
            count: notifications.length 
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error", error, success:false})
    }
}

export const markRead = async(req, res)=>{
    try {
        const userId = req.user?.userId
        const { notificationId } = req.params;

        if(!userId){
            return res.status(400).json({message:"Unauthorised"});
        }
        if(!notificationId){
            return res.status(400).json({message: "Notification ID not found", success: false});
        }

        const notif = await notification.findOne({
            where: {
                id: notificationId,
                userId: userId
            }
        });

        if(!notif){
            return res.status(404).json({message: "Notification not found", success: false});
        }

        notif.is_read = true;
        await notif.save();

        return res.status(200).json({
            message: "Notification marked as read", 
            success: true,
            notification: notif
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error", 
            error, 
            success: false
        });
    }
}

export const markAllRead = async(req, res) => {
    try {
        const userId = req.user?.id;
        
        if(!userId){
            return res.status(401).json({message: "Unauthorised", success: false});
        }

        const [updatedCount] = await notification.update(
            { is_read: true },
            { 
                where: { 
                    userId: userId,
                    is_read: false 
                }
            }
        );

        return res.status(200).json({
            message: "All notifications marked as read", 
            success: true,
            count: updatedCount
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error", 
            error, 
            success: false
        });
    }
}