const Joi = require("joi");

const createSchema = Joi.object({
  taskId: Joi.number()
    .integer()
    .positive()
    .allow(null),

  projectId: Joi.number()
    .integer()
    .positive()
    .allow(null),

  title: Joi.string()
    .trim()
    .max(255)
    .required(),

  description: Joi.string()
    .allow("", null),

  overtimeDate: Joi.date()
    .required(),

  estimatedHours: Joi.number()
    .min(0)
    .max(999.99)
    .allow(null),

  actualHours: Joi.number()
    .min(0)
    .max(999.99)
    .allow(null),

  priority: Joi.string()
    .valid(
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT"
    )
    .default("MEDIUM"),

  status: Joi.string()
    .valid(
      "PENDING",
      "IN_PROGRESS",
      "IN_REVIEW",
      "BLOCKED",
      "COMPLETED",
      "CANCELLED"
    )
    .default("PENDING"),

  reason: Joi.string()
    .allow("", null),
});

const updateSchema = Joi.object({
  taskId: Joi.number()
    .integer()
    .positive()
    .allow(null),

  projectId: Joi.number()
    .integer()
    .positive()
    .allow(null),

  title: Joi.string()
    .trim()
    .max(255),

  description: Joi.string()
    .allow("", null),

  overtimeDate: Joi.date(),

  estimatedHours: Joi.number()
    .min(0)
    .max(999.99)
    .allow(null),

  actualHours: Joi.number()
    .min(0)
    .max(999.99)
    .allow(null),

  priority: Joi.string()
    .valid(
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT"
    ),

  reason: Joi.string()
    .allow("", null),
}).min(1);

exports.validateCreate = (body) => {
  const { error, value } =
    createSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

  if (error) {
    throw error;
  }

  return value;
};

exports.validateUpdate = (body) => {
  const { error, value } =
    updateSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

  if (error) {
    throw error;
  }

  return value;
};





