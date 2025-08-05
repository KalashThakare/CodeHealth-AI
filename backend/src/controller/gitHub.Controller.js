import axios from "axios";

export const ListRepos = async (req, res) => {
    try {
        const token = req.cookies?.gitHubtoken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(400).json({ message: "Unauthorised" });
        }

        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
            }
        });

        return res.status(200).json(response.data);

    } catch (error) {

        console.error('GitHub API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });

    }
}