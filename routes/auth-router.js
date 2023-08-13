import express from 'express';

import authController from '../controllers/auth-controller.js';
import { validateBody } from '../decorators/index.js';
import usersSchemas from '../schemas/users-schemas.js';
import {
  authenticate,
  checkFileType,
  isEmptyAvatar,
  isEmptySubscription,
  upload,
} from '../middlewares/index.js';

const authRouter = express.Router();

authRouter.post(
  '/register',
  validateBody(usersSchemas.userRegisterSchema),
  authController.register
);

authRouter.get('/verify/:verificationToken', authController.verify);

authRouter.post(
  '/verify',
  validateBody(usersSchemas.userEmailSchema),
  authController.resendVerifyEmail
);

authRouter.get('/delete/:verificationToken', authController.deleteUser);

authRouter.post(
  '/login',
  validateBody(usersSchemas.userLoginSchema),
  authController.login
);

authRouter.get('/current', authenticate, authController.getCurrent);

authRouter.post('/logout', authenticate, authController.logout);

authRouter.patch(
  '/',
  authenticate,
  isEmptySubscription,
  validateBody(usersSchemas.userUpdateSubscriptionSchema),
  authController.updateUserSubscription
);

authRouter.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  isEmptyAvatar,
  checkFileType(['image/jpeg', 'image/png']),
  authController.changeAvatar
);

export default authRouter;
