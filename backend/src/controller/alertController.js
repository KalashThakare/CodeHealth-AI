import notification from "../database/models/notification.js";
import alertRule from "../database/models/observability/alert.js";
import AlertTrigger from "../database/models/observability/alertTrigger.js";
import User from "../database/models/User.js";
import { sendAlertMail } from "../lib/mail/noodemailer.js";
import { getRepoMetrics, isInCooldown, evaluateCondition } from "../utils/alertHelperFunctions.js";
import { createAlertNotification } from "../utils/alertNotificationHelper.js";


export async function triggerAlertScan(repoId, userId) {
  try {

    console.log("==============================================================================================================================================================================================")
    if (!repoId || !userId) {
      throw Error("fields are missing for triggerAlertScan");
    }

    const user = await User.findOne({
      where: {
        id: userId
      }
    })

    const conditions = await alertRule.findAll({
      where: {
        repoId: repoId,
        userId: userId,
        isActive: true
      }
    });

    //current metrics for the repository
    const metrics = await getRepoMetrics(repoId);

    // Process each alert condition
    for (const condition of conditions) {
      try {
        // Skip if alert is in cooldown period
        if (isInCooldown(condition.lastTriggeredAt, condition.cooldownMinutes)) {
          console.log(`Alert ${condition.name} is in cooldown period`);
          continue;
        }

        let currentValue;
        switch (condition.name) {
          case 'healthAlert':
            currentValue = metrics.healthScore;
            break;
          case 'stalePRs':
            currentValue = metrics.stalePRs;
            break;
          case 'codeQuality':
            currentValue = metrics.codeQuality;
            break;
          case 'highRiskFiles':
            currentValue = metrics.highRiskFiles;
            break;
          case 'technicalDebt':
            currentValue = metrics.technicalDebt;
            break;
          default:
            console.warn(`Unknown alert type: ${condition.name}`);
            continue;
        }

        // Check if condition is met
        const conditionMet = evaluateCondition(
          currentValue,
          condition.operator,
          condition.threshold
        );

        if (conditionMet) {
          const existingTrigger = await AlertTrigger.findOne({
            where: {
              alertId: condition.id,
              status: 'active'
            }
          });

          if (!existingTrigger) {

            const newTrigger = await AlertTrigger.create({
              alertId: condition.id,
              currentValue: currentValue,
              thresholdValue: condition.threshold,
              status: 'active',
              metadata: {
                alertName: condition.name,
                operator: condition.operator,
                repoId: repoId,
                userId: userId
              }
            });

            await sendAlertMail(user.email, {
              alertName: condition.name,
              repoName: metrics.repoName,
              currentValue: currentValue,
              threshold: condition.threshold,
              operator: condition.operator,
              triggeredAt: newTrigger.triggeredAt,
              dashboardLink: 'http://localhost:3000/dashboard/projects'
            })

            const title = `Alert Triggered: ${condition.name}`;

            const message = `The "${condition.name}" for repository "${metrics.repoName}" has been triggered. 
                            Current value: ${currentValue}, Threshold: ${condition.operator} ${condition.threshold}.`;

            await createAlertNotification(
              userId,       
              title,
              message
            );

            await condition.update({
              lastTriggeredAt: new Date(),
              triggerCount: condition.triggerCount + 1
            });

            console.log(`Alert triggered: ${condition.name} for repo ${repoId}`);
          }
        } else {
          const activeTrigger = await AlertTrigger.findOne({
            where: {
              alertId: condition.id,
              status: 'active'
            }
          });

          if (activeTrigger) {
            // Resolve the trigger
            await activeTrigger.update({
              status: 'resolved',
              resolvedAt: new Date()
            });

            await notification.destroy({
              where:{
                userId:userId,
                title:`Alert Triggered: ${condition.name}`
              }
            })
            console.log(`Alert resolved: ${condition.name} for repo ${repoId}`);
          }
        }
      } catch (alertError) {
        console.error(`Error processing alert ${condition.name}:`, alertError);
      }
    }

    return {
      success: true,
      alertsProcessed: conditions.length
    };

  } catch (error) {
    console.error("Error in triggerAlertScan:", error);
    throw error;
  }
}

export const createAlert = async (req, res) => {
  try {

    const { name, threshold, repoId, operator } = req.body;
    const userId = req.user?.id;

    if (!name || !threshold || !repoId) {
      return res.status(400).json({ message: "Fields are missing" });
    }

    const alert = await alertRule.findOne({
      where: {
        repoId: repoId,
        name: name
      }
    })

    if (alert) {
      return res.status(400).json({ success: false, message: "Alert rule already exist" });
    }

    const newalertRule = await alertRule.create({
      repoId: repoId,
      userId: userId,
      name: name,
      threshold: threshold,
      operator: operator
    });

    res.status(200).json({ success: true, newalertRule });

  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const deleteAlert = async (req, res) => {
  try {
    const { repoId, name } = req.body;
    if (!repoId || !name) {
      return res.status(400).json({ message: "Fields are missing" });
    }

    const alert = await alertRule.findOne({
      where: {
        repoId: repoId,
        name: name
      }
    })

    if (!alert) {
      return res.status(400).json({ message: "No alert exist", success: false });
    }

    await alert.destroy();

    return res.status(200).json({ message: "alert rule destroyed successfully" });

  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({ success: false, message: "Internal server error", error });
  }
}

export const modifyAlert = async (req, res) => {
  try {

    const { threshold, operator, repoId, name } = req.body;

    const alert = await alertRule.findOne({
      where: {
        repoId: repoId,
        name: name
      }
    })

    if (!alert) {
      return res.status(400).json({ message: "alert dosent exist try creating one first" });
    }

    const newThreshold = parseFloat(threshold);

    if (isNaN(newThreshold)) {
      return res.status(400).json({
        success: false,
        message: "Invalid threshold value. Must be a number"
      });
    }

    if (alert.threshold === newThreshold && alert.operator === operator) {
      return res.status(400).json({
        success: false,
        message: "Fields are same as current values. Cannot modify with identical values"
      });
    }

    await alert.update({
      threshold: newThreshold,
      operator: operator
    })

    return res.status(200).json({ message: "Alert updated", success: true });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error", error })
  }
}

export const getAlert = async (req, res) => {
  try {

    const userId = req.user?.id;
    const { repoId } = req.params;

    if (!repoId) {
      return res.status(400).json({ success: false, message: "repoId is missing" });
    }

    const alerts = await alertRule.findAll({
      where: {
        repoId: repoId,
        userId: userId
      }
    })

    if (!alerts || alerts.length == 0) {
      return res.status(400).json({ success: false, message: "No alerts found create new one" });
    }

    return res.status(200).json({ success: true, alerts });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error", error });
  }
}


export const toggleAlert = async (req, res) => {
  try {

    const { boolean, repoId, name } = req.body;
    const userId = req.user?.id;

    if (!repoId || !name) {
      return res.status(400).json({ success: false, message: "Fields are missing" });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Find the alert rule
    const alert = await alertRule.findOne({
      where: {
        userId: userId,
        repoId: repoId,
        name: name
      }
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert rule not found"
      });
    }

    await alert.update({
      isActive: boolean
    });

    return res.status(200).json({
      success: true,
      message: `Alert ${boolean ? 'enabled' : 'disabled'} successfully`,
      data: {
        id: alert.id,
        name: alert.name,
        repoId: alert.repoId,
        isActive: alert.isActive,
        threshold: alert.threshold,
        operator: alert.operator
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}


