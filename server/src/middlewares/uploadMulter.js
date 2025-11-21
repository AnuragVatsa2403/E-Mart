import multer from "multer";


// Set storage destination & filename
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null,"Public/images/");
  },
  filename(req, file, cb) {
    const detail= `${Date.now()}-${file.originalname}`
    cb(null, detail);
  },
});

// Allow only image types
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG/PNG images allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
