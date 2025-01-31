import Contestant from '../models/contestant.js';

// Controller function to handle saving contestants
export async function saveContestants(req, res) {
    const { names, points } = req.body;

    // Ensure names and points arrays have the same length
    if (names.length !== points.length) {
        return res.status(400).json({ error: 'Names and points arrays must have the same length' });
    }

    try {
        // Create and save contestants
        const savedContestants = await Promise.all(names.map(async (name, index) => {
            const newContestant = new Contestant({
                name,
                points: points[index] // Assign points from the array
            });
            return await newContestant.save();
        }));

        res.json(savedContestants);
    } catch (error) {
        console.error('ERROR: Failed to save contestants');
        res.status(500).json({ error: 'Failed to save contestants' });
    }
}
export async function getContestants(req, res) {
    try {
        const contestants = await Contestant.find().sort({ points: -1, name: 1 }).limit(50);
        res.json(contestants);
    } catch (error) {
        console.error('ERROR: Failed to fetch contestants');
        res.status(500).json({ error: 'Failed to fetch contestants' });
    }
}