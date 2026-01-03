const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(6).max(32).required(),
  message: Joi.string().max(1000).optional()
});

function validateLead(payload) {
  return schema.validate(payload, { abortEarly: true });
}

module.exports = { validateLead };
