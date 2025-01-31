import Setting from "../models/settings.js";

export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne();
        res.status(200).json(settings);
    } catch (error) {
        console.error("ERROR: Failed to fetch settings");
        res.status(500).json({ message: 'Failed to fetch settings', error });
    }
};

export const saveSettings = async (req, res) => {
    try {
        const settingsData = req.body;
        await Setting.replaceOne({}, settingsData);
        res.status(200).json(settingsData);
    } catch (error) {
        console.error("ERROR: Failed to save settings")
        res.status(500).json({ message: 'Failed to save settings', error });
    }
}