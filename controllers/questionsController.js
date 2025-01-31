import Question from "../models/question.js";
import Setting from "../models/settings.js"; 

export const getQuestions = async (req, res) => {
    try {
        // Fetch the settings
        const settings = await Setting.findOne();
        if (!settings) {
            return res.status(404).json({ message: "Settings not found!" });
        }

        const categories = settings.kategorije;
        const totalQuestions = settings.brojPitanja;
        const questionsPerCategory = Math.ceil(totalQuestions / categories.length);
        const allQuestions = [];

        // Fetch questions for each category
        for (const category of categories) {
            const categoryQuestions = await Question.aggregate([
                { $match: { kategorija: category } }, // Filter by category
                { $sample: { size: questionsPerCategory } }, // Randomly sample questions
            ]);

            allQuestions.push(...categoryQuestions);
        }

        // Shuffle the questions
        const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());

        // Select the exact number of questions needed
        const selectedQuestions = shuffledQuestions.slice(0, totalQuestions);

        res.status(200).json(selectedQuestions);
    } catch (error) {
        console.error("ERROR: Failed to fetch data / start the quiz");
        res.status(500).json({ message: error.message });
    }
};
