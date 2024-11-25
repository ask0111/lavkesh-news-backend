import express from 'express';
import { createUser, loginUser, refreshAccessTokenHandler, sendOtpByEmail, verifyOtpByEmail } from '../../controllers/adminControllers/auth.controller';
import { loginUserValidationRules, userValidationRules, validateRequest } from '../../common/Validation.funs/user.validation';

const router = express.Router();


router.post('/send-otp', sendOtpByEmail);
router.post('/verify-otp', verifyOtpByEmail);
router.post('/register', userValidationRules, validateRequest, createUser);
router.post('/login', loginUserValidationRules, validateRequest, loginUser);
router.post('/refresh-token', refreshAccessTokenHandler);

export default router