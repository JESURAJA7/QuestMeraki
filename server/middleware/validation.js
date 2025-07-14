const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateDownload = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['student', 'professional', 'educator', 'researcher', 'other'])
    .withMessage('Role must be one of: student, professional, educator, researcher, other'),
  
  body('blogId')
    .notEmpty()
    .withMessage('Blog ID is required')
    .isMongoId()
    .withMessage('Blog ID must be a valid MongoDB ObjectId'),
  
  body('blogTitle')
    .trim()
    .notEmpty()
    .withMessage('Blog title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Blog title must be between 1 and 200 characters'),
  
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must be less than 500 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateDownload,
  handleValidationErrors
};