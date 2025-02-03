import Joi from 'joi';

const schemas = {
  register: Joi.object({
    username: Joi.string().min(1).max(12).pattern(/^[a-zA-Z0-9_]+$/).required(),
    handle: Joi.string().min(1).max(12).pattern(/^[a-zA-Z0-9_]+$/).required(),
    password: Joi.string().min(6).required()
  }),
  login: Joi.object({
    handle: Joi.string().required(),
    password: Joi.string().required()
  })
};

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schemas[schema].validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};