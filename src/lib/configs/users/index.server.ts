import jwt from 'jsonwebtoken';
import db from '$lib/db/db.server';
import { env } from '$env/dynamic/private';
import { t } from '$lib/lang';

// Função genérica para manipular erros e retornos
const handleError = (error, message) => {
	console.error(error);
	throw new Error(message);
};

let translations;

t.subscribe((value) => {
	translations = value;
});

// Função para obter usuário pelo email
export const getUserByEmail = async (email: string): Promise<any | null> => {
	try {
		return db.prepare('SELECT * FROM user WHERE email = ?').get(email) || null;
	} catch (error) {
		handleError(error, translations.errors.fetchUser);
	}
};

// Função para obter usuário pelo token de redefinição
export const getUserByResetToken = async (token: string): Promise<any | null> => {
	try {
		return db.prepare('SELECT * FROM user WHERE reset_token = ?').get(token) || null;
	} catch (error) {
		handleError(error, translations.errors.fetchUser);
	}
};

// Função para obter usuário pelo token
export const getUserByToken = async (token: string): Promise<any | null> => {
	try {
		return db.prepare('SELECT * FROM user WHERE token = ?').get(token) || null;
	} catch (error) {
		handleError(error, translations.errors.fetchUser);
	}
};

// Função para obter todos os papéis dos usuários
export const getUsersRoles = async (): Promise<any[]> => {
	try {
		return db.prepare('SELECT * FROM user_role').all();
	} catch (error) {
		handleError(error, translations.errors.fetchRoles);
	}
};

export const getUsers = async (
	page: number,
	pageSize: number,
	search: string,
	offset: number
): Promise<{ users: any[]; total: number; page: number; pageSize: number; search: string }> => {
	try {
		// Obter utilizadores com datas convertidas para horário local
		const users = db
			.prepare(
				`
                SELECT user.email, 
                       datetime(user.created_at, 'localtime') AS created_at, 
                       datetime(user.last_login, 'localtime') AS last_login, 
                       user_role.role, 
                       user_role.id AS role_id
                FROM user
                JOIN user_role ON user.role_id = user_role.id
                WHERE user.email LIKE ?
                LIMIT ? OFFSET ?
                `
			)
			.all(`%${search}%`, pageSize, offset);

		// Obter o número total de utilizadores com base na pesquisa
		const totalResult = db
			.prepare(
				`
                SELECT COUNT(*) AS total
                FROM user
                WHERE email LIKE ?
                `
			)
			.get(`%${search}%`);

		const total = totalResult?.total ?? 0;

		return {
			users,
			total,
			page,
			pageSize,
			search
		};
	} catch (error) {
		return { users: [], total: 0, page, pageSize, search };
	}
};

// Função para excluir usuário pelo email
export const deleteUser = async (email: string): Promise<boolean> => {
	try {
		const result = db.prepare('DELETE FROM user WHERE email = ?').run(email);
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.deleteUser);
	}
};

// Função para inserir um novo usuário
export const insertUser = async (user: any): Promise<boolean> => {
	try {
		const result = db
			.prepare(
				'INSERT INTO user (email, password, role_id, token) VALUES (@email, @password, @role_id, @token)'
			)
			.run(user);
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.insertUser);
	}
};

// Função para atualizar a senha do usuário
export const updateUserPassword = async (email: string, password: string): Promise<boolean> => {
	try {
		const result = db.prepare('UPDATE user SET password = ? WHERE email = ?').run(password, email);
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.updatePassword);
	}
};

// Função para atualizar o token de redefinição do usuário
export const updateUserResetToken = async (email: string, token: string): Promise<boolean> => {
	try {
		const result = db.prepare('UPDATE user SET reset_token = ? WHERE email = ?').run(token, email);
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.updateResetToken);
	}
};

// Função para atualizar o token do usuário
export const updateUserToken = async (email: string, token: string): Promise<boolean> => {
	try {
		const result = db.prepare('UPDATE user SET token = ? WHERE email = ?').run(token, email);
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.updateResetToken);
	}
};

// Função para atualizar o papel do usuário
export const updateUserRole = async (email: string, role: number): Promise<boolean> => {
	try {
		const result = db.prepare('UPDATE user SET role_id = ? WHERE email = ?').run(role, email);
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.updateRole);
	}
};

// Função para atualizar a chave da API do usuário
export const updateUserApiKey = async (
	email: string,
	encryptedKey: string,
	maskedKey: string
): Promise<boolean> => {
	try {
		const result = db
			.prepare('UPDATE user SET encrypted_key = ?, masked_key = ? WHERE email = ?')
			.run(encryptedKey, maskedKey, email);
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.updateApiKey);
	}
};

// Função para atualizar o último login do usuário
export const updateUserLastLogin = async (email: string): Promise<boolean> => {
	try {
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
		const result = db.prepare('UPDATE user SET last_login = ? WHERE email = ?').run(now, email);
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.updateLastLogin);
		return false;
	}
};

// Função para obter usuários administradores e gestores
export const getAdminAndManagerUsers = async (): Promise<any[]> => {
	try {
		const stmt = db.prepare(`
      SELECT * FROM user
      JOIN user_role ON user.role_id = user_role.id
      WHERE (user_role.role = 'GESTOR' OR user_role.role = 'ADMIN') 
      AND user.encrypted_key IS NOT NULL
    `);
		return stmt.all();
	} catch (error) {
		handleError(error, translations.errors.fetchUser);
	}
};

// Função para verificar a sessão do usuário usando um cookie de autenticação
export const verifySession = async (authCookie: string): Promise<any | null> => {
	try {
		const token = authCookie.replace('AuthorizationToken=Bearer%20', '');

		const jwtUser = jwt.verify(token, env.SECRET_JWT_TOKEN);

		if (typeof jwtUser === 'string') {
			throw new Error(translations.errors.occurred);
		}

		const user = await getUserByEmail(jwtUser.email);

		if (!user) {
			throw new Error(translations.session.incorrectAccess);
		}

		return {
			email: user.email,
			role: user.role_id
		};
	} catch (error) {
		return null;
	}
};
