import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ApiResponse } from '../types';

// Generic validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    } as ApiResponse);
    return;
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one digit'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('role')
    .isIn(['Admin', 'Manager', 'User', 'Viewer'])
    .withMessage('Role must be one of: Admin, Manager, User, Viewer'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Rule validation rules
export const validateCreateRule = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Rule name must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('dsl')
    .trim()
    .notEmpty()
    .withMessage('DSL code is required')
    .isLength({ max: 10000 })
    .withMessage('DSL code cannot exceed 10000 characters'),
  body('status')
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be one of: active, inactive, draft'),
  body('priority')
    .isInt({ min: 1, max: 100 })
    .withMessage('Priority must be an integer between 1 and 100'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 0) {
        return tags.every((tag: any) => typeof tag === 'string' && tag.trim().length > 0);
      }
      return true;
    })
    .withMessage('All tags must be non-empty strings'),
  handleValidationErrors
];

export const validateUpdateRule = [
  param('id')
    .notEmpty()
    .withMessage('Rule ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Rule name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('dsl')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('DSL code cannot be empty')
    .isLength({ max: 10000 })
    .withMessage('DSL code cannot exceed 10000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be one of: active, inactive, draft'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Priority must be an integer between 1 and 100'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 0) {
        return tags.every((tag: any) => typeof tag === 'string' && tag.trim().length > 0);
      }
      return true;
    })
    .withMessage('All tags must be non-empty strings'),
  handleValidationErrors
];

// Action validation rules
export const validateCreateAction = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Action name must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('type')
    .isIn(['email', 'sms', 'webhook', 'database', 'notification'])
    .withMessage('Type must be one of: email, sms, webhook, database, notification'),
  body('config')
    .isObject()
    .withMessage('Config must be a valid JSON object'),
  body('status')
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be one of: active, inactive, draft'),
  handleValidationErrors
];

export const validateUpdateAction = [
  param('id')
    .notEmpty()
    .withMessage('Action ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Action name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('type')
    .optional()
    .isIn(['email', 'sms', 'webhook', 'database', 'notification'])
    .withMessage('Type must be one of: email, sms, webhook, database, notification'),
  body('config')
    .optional()
    .isObject()
    .withMessage('Config must be a valid JSON object'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be one of: active, inactive, draft'),
  handleValidationErrors
];

// Common validation rules
export const validateId = [
  param('id')
    .notEmpty()
    .withMessage('ID is required'),
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100')
    .toInt(),
  handleValidationErrors
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate(),
  handleValidationErrors
];