import Database from 'better-sqlite3-multiple-ciphers';
import { env } from '$env/dynamic/private'; // SECRET_DB_KEY é a chave de criptografia
import { building } from '$app/environment';

let db = null;

if (!building) {
	try {
		db = new Database(env.SECRET_DB_PATH, {
			// verbose: console.log
		});

		db.pragma(`cipher = '${env.SECRET_DB_CIPHER}'`); // Define o tipo de cipher
		db.pragma(`${env.SECRET_DB_COMPATIBALITY}`); // Define o modo de compatibilidade
		db.pragma(`key = '${env.SECRET_DB_KEY}'`); // Define a chave de criptografia
	} catch (err) {
		console.error('Erro ao abrir base de dados:', err);

		// Evita que a aplicação quebre no build
		if (process.env.NODE_ENV === 'production' && process.env.BUILD_MODE === 'true') {
			console.warn('Base de dados ignorada durante o build.');
		} else {
			throw new Error('Erro ao abrir base de dados! ' + err);
		}
	}
}

// Exportar a instância do banco de dados (pode ser `null` durante o build)
export default db;
