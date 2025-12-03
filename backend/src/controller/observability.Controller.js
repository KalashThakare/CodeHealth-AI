import { PushActivityMetrics } from "../database/models/observability/pushActivityMetrics.js";

export const pushActivity = async (req, res) => {
    try {
        const { repoId } = req.params;
        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const metrics = await PushActivityMetrics.findAll({
            where: {
                repoId: repoId,
                date: {
                    [Op.gte]: startDate.toISOString().split('T')[0]
                }
            },
            order: [['date', 'ASC']]
        });

        // Calculate summary statistics
        const summary = {
            totalPushes: metrics.reduce((sum, m) => sum + m.totalPushes, 0),
            totalCommits: metrics.reduce((sum, m) => sum + m.totalCommits, 0),
            avgPushesPerDay: metrics.length > 0
                ? (metrics.reduce((sum, m) => sum + m.totalPushes, 0) / metrics.length).toFixed(2)
                : 0,
            avgCommitsPerDay: metrics.length > 0
                ? (metrics.reduce((sum, m) => sum + m.totalCommits, 0) / metrics.length).toFixed(2)
                : 0,
            activeDays: metrics.filter(m => m.isActive).length,
            uniqueContributors: new Set(
                metrics.flatMap(m => m.contributorActivity.map(c => c.userId))
            ).size
        };

        // Aggregate hourly heatmap (combine all days)
        const heatmapData = Array(24).fill(0);
        metrics.forEach(metric => {
            metric.hourlyDistribution.forEach((count, hour) => {
                heatmapData[hour] += count;
            });
        });

        // Top contributors (across all days)
        const contributorMap = new Map();
        metrics.forEach(metric => {
            metric.contributorActivity.forEach(contributor => {
                if (!contributorMap.has(contributor.userId)) {
                    contributorMap.set(contributor.userId, {
                        userId: contributor.userId,
                        totalPushes: 0,
                        totalCommits: 0
                    });
                }
                const c = contributorMap.get(contributor.userId);
                c.totalPushes += contributor.pushCount;
                c.totalCommits += contributor.commitCount;
            });
        });

        const topContributors = Array.from(contributorMap.values())
            .sort((a, b) => b.totalCommits - a.totalCommits)
            .slice(0, 10);

        return res.status(200).json({
            summary,
            dailyMetrics: metrics,
            heatmapData: heatmapData.map((count, hour) => ({ hour, count })),
            topContributors
        });
    } catch (error) {
        console.error('Error fetching push activity:', error);
        return res.status(500).json({ error: error.message });
    }
}

export const heatMap = async (req, res) => {
    try {
        const { repoId } = req.params;
        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const metrics = await PushActivityMetrics.findAll({
            where: {
                repoId: repoId,
                date: {
                    [Op.gte]: startDate.toISOString().split('T')[0]
                }
            }
        });

        // Build heatmap: [{ day: "Monday", hour: 9, count: 15 }, ...]
        const heatmap = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        metrics.forEach(metric => {
            const dayOfWeek = new Date(metric.date).getDay();
            const dayName = dayNames[dayOfWeek];

            metric.hourlyDistribution.forEach((count, hour) => {
                const key = `${dayName}-${hour}`;
                if (!heatmap[key]) {
                    heatmap[key] = { day: dayName, hour, count: 0 };
                }
                heatmap[key].count += count;
            });
        });

        const heatmapData = Object.values(heatmap);

        res.json({ heatmapData });
    } catch (error) {
        console.error('Error fetching activity heatmap:', error);
        res.status(500).json({ error: error.message });
    }
}