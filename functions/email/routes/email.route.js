import express from 'express';
import passport from 'passport';

import EmailController from '../controllers/email.controller';
import emailTemplateRoute from './email.template.route';
import isAllowed from '../../common/config/auth/policies/auth.policy';

const router = express.Router();
router.post('/send', EmailController.send);
router.use('/template', passport.authenticate('jwt', { session: false }), isAllowed, emailTemplateRoute);

export default router;
