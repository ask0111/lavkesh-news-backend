import express from 'express';
import { checkAuthorization, createUser, getUserByProfileId, loginUser, refreshAccessTokenHandler, resetPassword, sendOtpByEmail, sendResetPasswordEmail, updateUserProfile, verifyOtpByEmail, verifyResetToken } from '../../controllers/adminControllers/auth.controller';
import { loginUserValidationRules, userValidationRules, validateRequest } from '../../common/Validation.funs/user.validation';
import { resetTokenValidate } from '../../middlewares/auth.middleware';

const router = express.Router();
import multer from "multer";


export const uploadProfile = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

router.post('/send-otp', sendOtpByEmail);
router.post('/verify-otp', verifyOtpByEmail);
router.post('/register', userValidationRules, validateRequest, createUser);
router.post('/login', loginUserValidationRules, validateRequest, loginUser);
router.post('/refresh-token', refreshAccessTokenHandler);
router.post('/reset-link-send-to-email', sendResetPasswordEmail);
router.get('/verify-reset-token', resetTokenValidate, verifyResetToken);
router.post('/reset-password', resetTokenValidate, resetPassword);
router.get('/check-authorization', checkAuthorization);

// profile
router.get('/profile/:profileId', getUserByProfileId);
router.put('/edit-profile/:profileId', updateUserProfile);

export default router