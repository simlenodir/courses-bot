import Joi from "joi";

export const courseValidation = Joi.object().keys({
    name: Joi.string().required().max(15).min(3),
    describtion: Joi.string().required().max(256).min(3),
})