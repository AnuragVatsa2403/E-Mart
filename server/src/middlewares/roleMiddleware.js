export const isShopkeeper = (req, res, next) => {
  if (req.user && req.user.role === "shopkeeper") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Shopkeepers only" });
  }
};

export const isUser = (req, res, next) => {
  if (req.user && req.user.role === "user") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Users only" });
  }
};
