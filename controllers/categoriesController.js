import Category from '../models/category.js';

export async function getCategories(req, res){
    try {
        const categories = await Category.find(); // Fetch categories from MongoDB
        res.json(categories);
    } catch (error) {
        console.error("ERROR: Failed to fetch categories");
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};