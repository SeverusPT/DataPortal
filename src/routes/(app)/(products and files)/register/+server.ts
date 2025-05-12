import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import {
	deleteUser,
	getUserByEmail,
	getUsersRoles,
	insertUser
} from '$lib/configs/users/index.server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { _validateEmail, _validateForm, _validatePassword } from './+page';
import { deleteAnswersByToken, saveAnswersToDb } from '$lib/configs/answers/index.server';
import { v4 as uuidv4 } from 'uuid';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	let newUser = null; // Declare newUser no scope superior para acessá-lo no catch

	try {
		// Obtendo dados do request
		const data = await request.json();
		const { questionnaireForm: questionnaire, userForm: user, registerSteps: steps } = data;

		// Validar questionário e dados do utilizador
		validateUserInput(user);
		const isValidForm = _validateForm(null, steps, questionnaire);

		if (!isValidForm.isValid) {
			throw new Error(translations.register.invalidQuestionnaire);
		}

		// Guardar o utilizador
		newUser = await saveUser(user);

		if (!newUser) {
			throw new Error(translations.errors.insertUser);
		}

		//Gerar UUID para respostas e guardar o questionário
		const uuid = uuidv4();
		await saveAnswersToDb(questionnaire, newUser.token, uuid);

		//Enviar email de confirmação
		await sendConfirmationEmail(user.email, newUser.token);

		return json({ success: true, message: translations.register.success });
	} catch (error) {
		// Fazer rollback caso o utilizador tenha sido criado mas algo tenha falhado
		if (newUser) {
			await rollbackUser(newUser);
		}

		return json({
			success: false,
			message: error.message || translations.register.genericError
		});
	}
};

// Função auxiliar para validar inputs do utilizador
const validateUserInput = (user) => {
	if (!user.email || !user.password || !user.repeatPassword) {
		throw new Error(translations.forms.fillAllFields);
	}

	if (user.password !== user.repeatPassword) {
		throw new Error(translations.password.match);
	}

	const passwordValidation = _validatePassword(user.password);
	if (!passwordValidation.isValid) {
		throw new Error(translations.password.rulesFailed);
	}

	const emailValidation = _validateEmail(user.email);
	if (!emailValidation) {
		throw new Error(translations.errors.invalidEmail);
	}
};

// Função auxiliar para fazer rollback do usuário recém-criado e suas respostas
const rollbackUser = async (user) => {
	try {
		const existsUser = await getUserByEmail(user.email);
		if (existsUser) {
			const res = await deleteUser(user.email);
			if (res) {
				await deleteAnswersByToken(user.token);
			} else {
			}
		}
	} catch (error) {}
};

const saveUser = async (user) => {
	const { email, password } = user;

	// Verificar se o utilizador já existe
	const existsUser = await getUserByEmail(email);
	if (existsUser) {
		throw new Error(translations.user.alreadyExists);
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const token = jwt.sign({ email }, privateEnv.SECRET_JWT_TOKEN, {
		expiresIn: '1d'
	});

	const usersRoles = await getUsersRoles();
	const noAccessRole = usersRoles.find((roleObj) => roleObj.role === 'NOACCESS');

	const newUser = {
		email,
		password: hashedPassword,
		role_id: noAccessRole.id,
		token
	};

	const userInserted = await insertUser(newUser);
	if (userInserted) {
		return newUser;
	} else {
		throw new Error(translations.errors.insertUser);
	}
};

const sendConfirmationEmail = async (email: string, token: string) => {
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
		subject: `${translations.register.confirmation}`,
		html: `
    <div>
    <div style="background-color: #e3e5dc; padding: 8px 16px; text-align: center; border-radius: 20px 20px 0px 0px">
        <img src="https://severus.pt/wp-content/uploads/2021/08/serverus-black.png"/>
    </div>
    <div style="background-color:#F8FAFC; padding: 20px; border-radius: 0px 0px 20px 20px">
        [PT]
        <p>Olá, ${email.split('@')[0]}</p>
        <p>Obrigado por se registar na plataforma SeverusPT. Para confirmar a sua conta, clique no link abaixo!</p>
        <p>O token é valido apenas por 24 horas!</p>
        <p>Se não efetuou o registo na nossa plataforma, ignore este email.</p>
      <hr>
        [EN]
        <p>Hello, ${email.split('@')[0]}</p>
      <p>
        Thank you for registering on the SeverusPT platform. To confirm your account, click on the link below!
      </p>
      <p>
        The token is valid for 24 hours only!
      </p>
      <p>
        If you have not registered on our platform, please ignore this email.
      </p>
      <hr>
      <a href="${
				publicEnv.PUBLIC_BASE_URL
			}/register/${token}" style="display: block; margin: 0 auto; background-color: #c1cad6; padding:8px 16px; border-radius: 50px; color: white; border: none; text-decoration: none; margin-top: 16px; width: fit-content;">
    Confirmar/Confirm email
      </a>
    </div>
    </div>
    `
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		if (error.message.includes('Invalid login')) {
			throw new Error(translations.register.errorEmailLogin);
		}
		throw new Error(translations.register.errorEmailGeneric);
	}
};
