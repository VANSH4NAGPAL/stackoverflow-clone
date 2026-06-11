import Article from "../models/article.js";

export const createArticle = async (req, res) => {
  const { title, body, tags } = req.body;
  const author = req.userid;

  if (!title || !body) return res.status(400).json({ message: "Title and body required" });

  try {
    const newArticle = new Article({ title, body, tags, author });
    await newArticle.save();
    return res.status(201).json({ message: "Article published", data: newArticle });
  } catch (error) {
    return res.status(500).json({ message: "Failed to publish article" });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate("author", "name").sort({ createdAt: -1 });
    return res.status(200).json({ data: articles });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch articles" });
  }
};

export const getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await Article.findById(id)
      .populate("author", "name")
      .populate("comments.author", "name");
    if (!article) return res.status(404).json({ message: "Article not found" });
    return res.status(200).json({ data: article });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch article" });
  }
};
