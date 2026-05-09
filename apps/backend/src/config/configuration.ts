import * as Joi from 'joi'

export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '10000', 10),
  },
  nodeEnv: process.env.NODE_ENV || 'development',
})

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  GEMINI_API_KEY: Joi.string().required(),
  GROQ_API_KEY: Joi.string().required(),
  AI_TIMEOUT_MS: Joi.number().default(10000),
  NODE_ENV: Joi.string().default('development'),
})
