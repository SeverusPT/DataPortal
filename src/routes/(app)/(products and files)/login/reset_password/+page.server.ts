import type { Actions } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {
	getUserByEmail,
	getUsersRoles,
	updateUserResetToken
} from '$lib/configs/users/index.server';
import { _verifyToken } from '../../register/[token]/+server';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

const handleUserAccess = async (email) => {
	const token = jwt.sign({ email }, privateEnv.SECRET_JWT_TOKEN, {
		expiresIn: '1d'
	});

	try {
		await updateUserResetToken(email, token);

		const response = await sendResetEmail(email, token);

		if (!response.success) {
			return {
				success: false,
				message: response.message
			};
		} else {
			return {
				success: true,
				message: response.message
			};
		}
	} catch (error) {
		return { success: false, message: error.message };
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email') as string;

		if (!email) {
			return {
				success: false,
				message: translations.forms.fillAllFields
			};
		}

		const user = await getUserByEmail(email);

		if (user === null) {
			return {
				success: false,
				message: translations.session.incorrectAccess
			};
		}

		const usersRoles = await getUsersRoles();
		const noAccessRole = usersRoles.find((roleObj) => roleObj.role === 'NOACCESS');

		if (user.role_id !== noAccessRole.id) {
			//verify if user already has a reset token that is still valid
			if (user.reset_token) {
				const { success, message } = await _verifyToken(user.reset_token, user);
				if (!success) {
					if (message !== translations.register.tokenExpired) {
						return {
							success: false,
							message: message
						};
					}
				} else {
					return {
						success: false,
						message: translations.register.tokenStillValid
					};
				}
			}

			return handleUserAccess(email);
		} else {
			return {
				success: false,
				message: translations.session.noAccess
			};
		}
	}
};

const sendResetEmail = async (email: string, token: string) => {
	const transporter = nodemailer.createTransport({
		//GMAIL
		service: privateEnv.SECRET_EMAIL_SERVICE,
		auth: {
			user: privateEnv.SECRET_SENDER_EMAIL,
			pass: privateEnv.SECRET_SENDER_PASSWORD
		}
	});

	const mailOptions = {
		from: `${privateEnv.SECRET_SENDER_NAME} <${privateEnv.SECRET_SENDER_EMAIL}>`,
		to: email,
		subject: `${translations.titles.resetPw}`,
		html: `
        <div>
        <div style="background-color: #e3e5dc; padding: 8px 16px; text-align: center; border-radius: 20px 20px 0px 0px">
            <img src="https://severus.pt/wp-content/uploads/2021/08/serverus-black.png"/>
        </div>
        <div style="background-color:#F8FAFC; padding: 20px; border-radius: 0px 0px 20px 20px">
            [PT]
            <p>Olá, ${email.split('@')[0]}</p>
            <p>Solicitou a recuperação da sua password. Por favor, siga as instruções abaixo para redefinir a sua password de forma segura:</p>
            <ol>
                <li>Clique no link abaixo para aceder à página de redefinição da password.</li>
                <li>Escolha uma nova password forte e única, e confirme-a no campo correspondente.</li>
            </ol>
            <p>O link é valido apenas por 24 horas!</p>
            <p>Se não efetuou o pedido na nossa plataforma, ignore este email.</p>
          <hr>
            [EN]
            <p>Hello, ${email.split('@')[0]}</p>
            <p>You have requested your password recovery. Please follow the instructions below to reset your password securely:</p>
            <ol>
                <li>Click on the link below to access the password reset page.</li>
                <li>Choose a new strong and unique password, and confirm it in the corresponding field.</li>
            </ol>
            <p>The link is only valid for 24 hours!</p>
            <p>If you have not requested password recovery on our platform, please ignore this email.</p>
          <hr>
          <a href="${
						publicEnv.PUBLIC_BASE_URL
					}/login/reset_password/${token}" style="display: block; margin: 0 auto; background-color: #c1cad6; padding:8px 16px; border-radius: 50px; color: white; border: none; text-decoration: none; margin-top: 16px; width: fit-content;">
        Redefinir/Reset password
          </a>
        </div>
        </div>
        `
	};

	try {
		await transporter.sendMail(mailOptions);
		return {
			success: true,
			message: translations.session.resetEmailSent
		};
	} catch (error) {
		// If email fails to send remove reset token
		await updateUserResetToken(email, '');
		throw error;
	}
};
