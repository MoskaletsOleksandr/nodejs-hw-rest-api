import { HttpError } from '../helpers/index.js';

const checkFileType = (allowedTypes) => (req, res, next) => {
  if (!allowedTypes.includes(req.file.mimetype)) {
    next(HttpError(400, 'Invalid file type'));
  }

  next();
};

export default checkFileType;
