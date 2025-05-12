const pt = {
	session: {
		login: 'Entrar',
		logout: 'Sair',
		profile: 'Perfil',
		settings: 'Definições',
		users: 'Utilizadores',
		incorrectAccess: 'Dados de acesso incorretos!',
		noAccess: 'Utilizador sem acesso!',
		forgotPw: 'Esqueceu-se da password?',
		resetPwInfo:
			'Introduza o seu email e enviaremos instruções sobre como redefinir a sua password.',
		resetPwInstructions: 'Enviar instruções',
		resetEmailSent: 'Email enviado com sucesso!'
	},
	files: {
		add: 'Adicionar Ficheiros',
		nameErrors: 'Alguns ficheiros contêm erros, os filtros podem não ser aplicados corretamente!',
		dragNdrop: 'Arraste os ficheiros para aqui ou clique para selecionar ficheiros',
		successUpload: 'Ficheiro carregado com sucesso!'
	},
	folders: {
		add: 'Adicionar Produto de Dados',
		name: 'Nome do Produto',
		generateName: 'Gerar Nome',
		invalidName: 'Nome de produto inválido!',
		exists: 'O produto já existe!',
		successCreate: 'Produto criado com sucesso!'
	},
	titles: {
		data_products: 'Produtos de Dados',
		register: 'Registar',
		products: 'Produtos',
		help: 'Ajuda',
		info: 'Informação',
		resetPw: 'Redefinir a password',
		howtocite: 'Como Citar',
		versionInfo: 'Informação das Versões',
		data_products_history: 'Histórico de Produtos de Dados',
		wmsInfo: 'Informação do WMS'
	},
	buttons: {
		next: 'Seguinte',
		previous: 'Anterior'
	},
	municipality: 'município',
	country: 'país',
	other: 'outro',
	geographic: 'geográfico',
	home: 'Início',
	example: 'Exemplo',
	never: 'Nunca',
	version: {
		add: 'Adicionar Versão',
		version: 'Versão',
		latestVersion: 'Última Versão',
		noChangesVersion: 'Sem alterações nesta versão',
		changes_english: 'Alterações (Inglês)',
		changes_portuguese: 'Alterações (Português)',
		addVersionSuccess: 'Versão adicionada com sucesso!'
	},
	password: {
		rules: 'A password deve conter:',
		_length: 'Pelo menos 8 caracteres',
		uppercase: 'Pelo menos 1 letra maiúscula',
		lowercase: 'Pelo menos 1 letra minúscula',
		number: 'Pelo menos 1 número',
		specialCharacter: 'Pelo menos 1 caractere especial',
		repeat: 'Repetir password',
		match: 'As passwords devem ser iguais',
		toogle: 'Alternar a visibilidade da password',
		rulesFailed: 'A password não cumpre os requisitos!',
		samePassword: 'A nova password deve ser diferente da atual!',
		changed: 'Password alterada com sucesso!'
	},
	forms: {
		fillAllFields: 'Por favor preencha todos os campos',
		nuts3: 'Por favor selecione NUTS-3 primeiro'
	},
	work: 'trabalho',
	register: {
		tokenError: 'Token não encontrado!',
		tokenExpired: 'Token expirado!',
		tokenVerified: 'Token verificado!',
		tokenStillValid: 'Já possui um token válido!',
		invalidQuestionnaire: 'Questionário inválido!',
		accountRegistered: 'Conta registada com sucesso!',
		success:
			'Conta registada com sucesso! Por favor, verifique o seu email para confirmar o registo! Se não receber o email, verifique a pasta de spam.',
		tokenAnswersError: 'Erro a validar as respostas!',
		confirmation: 'Confirmação de Registo',
		validating: 'A validar conta...',
		redirect: 'Redirecionando...',
		deleteUserError: 'Erro ao eliminar utilizador!',
		errorEmailLogin: 'Não foi possível enviar o email. Tente novamente mais tarde.',
		errorEmailGeneric:
			'Houve um problema ao enviar o email. Por favor, tente novamente mais tarde.',
		genericError:
			'Houve um erro inesperado durante o processamento. Por favor, tente novamente mais tarde.',
		tokenVerificationError: 'Erro ao verificar o token.',
		answersValidated: 'Respostas validadas com sucesso!',
		answerValidationError: 'Erro a validar as respostas!'
	},
	user: {
		alreadyExists: 'O utilizador já existe!',
		updatedSuccess: 'Utilizador atualizado com sucesso!',
		updatedError: 'Erro ao atualizar utilizador!',
		confirmDeleteUser: 'Tem a certeza que deseja eliminar o utilizador {email}?',
		deleteUser: 'Eliminar Utilizador',
		deletedError: 'Erro ao eliminar utilizador!',
		deletedSuccess: 'Utilizador eliminado com sucesso!',
		resultsPerPage: 'Resultados por página',
		searchByEmail: 'Pesquisar por email',
		resetFilters: 'Limpar Filtros',
		showingUsers: 'A mostrar de {start} a {end} de {total} utilizadores'
	},
	tables: {
		name: 'Nome',
		files: 'Ficheiros',
		actions: 'Ações',
		lastUpdate: 'Última Atualização',
		nodata: 'Não há dados disponíveis!',
		viewContent: 'Ver Conteúdo',
		nameDetails: 'Detalhes do Nome',
		viewMetadata: 'Ver Metadados',
		openMap: 'Abrir Mapa',
		editName: 'Editar Nome',
		roleUser: 'Permissão',
		userCreatedAt: 'Criado Em',
		userLastSeen: 'Última Visita',
		userSettings: 'Definições de Utilzador',
		userDelete: 'Eliminar Utilizador'
	},
	actions: {
		save: 'Guardar',
		download: 'Descarregar',
		upload: 'Carregar',
		cancel: 'Cancelar',
		edit: 'Editar',
		delete: 'Eliminar',
		goBackTo: 'Voltar a',
		acceptCookies: 'Aceitar',
		declineCookies: 'Recusar'
	},
	errors: {
		version: 'Número de versão inválido!',
		versionExists: 'Versão já existe!',
		addVersion: 'Erro ao adicionar versão!',
		emptyChanges: 'Os campos de alterações não podem estar vazios!',
		components: 'Número de componentes inválido!',
		fixFolderName: 'Corrija o nome do produto para verificar os ficheiros!',
		diffValues: 'O valor deve ser o mesmo que o nome do produto!',
		invalidValue: 'Valor inválido!',
		unauthorized: 'Não Autorizado!',
		folderNotExists: 'O produto não existe!',
		noFiles: 'Não foram encontrados ficheiros!',
		fireLoc: 'Erro de leitura da inicialização dos locais de incêndio!',
		geoTIFF: 'O ficheiro de imagem (GeoTIFF) não existe!',
		opCode: 'Código de operação inválido!',
		markdown: 'O ficheiro Markdown não existe!',
		noFileData: 'Não há dados de ficheiro!',
		occurred: 'Ocorreu um erro!',
		missingExtensions: 'Extensões em falta',
		alreadyHaveResetToken: 'O utilizador já tem um token de redefinição!',
		fetchVersions: 'Erro ao obter versões!',
		noVersions: 'Nenhuma versão encontrada!',
		fetchSteps: 'Erro ao obter o questionário!',
		invalidEmail: 'Email inválido',
		saveAnswers: 'Erro ao guardar respostas do questionário!',
		fetchUser: 'Erro ao obter utilizador!',
		fetchRoles: 'Erro ao obter permissões!',
		deleteUser: 'Erro ao eliminar utilizador!',
		insertUser: 'Erro ao guardar utilizador!',
		updatePassword: 'Erro ao atualizar a password!',
		updateResetToken: 'Erro ao atualizar token de reset!',
		updateRole: 'Erro ao atualizar permissão do utilizador!',
		updateApiKey: 'Erro a atualizar chave de api!',
		deleteAnswers: 'Erro ao eliminar respostas do questionário!',
		fetchAnswers: 'Erro ao obter respostas do questionário!',
		updateAnswersToken: 'Erro ao atualizar token de respostas do questionário!',
		invalidFields: 'Campos inválidos!',
		userDataNotFound: 'Dados do utilizador não encontrados!',
		missingFileNames: 'Pedido inválido! Faltam os nomes dos ficheiros!',
		creatingZip: 'Erro ao criar ficheiro ZIP!',
		noFileSelected: 'Nenhum ficheiro selecionado!',
		somethingWentWrong: 'Algo correu mal!',
		errorCreatingRgb: 'Erro ao criar RGB a partir de TIFF!',
		colorMapNotFound: 'Mapa de cores não encontrado para {colormap}!',
		errorFetchingResponse: 'Erro ao obter a resposta!',
		updateLastLogin: 'Erro ao atualizar última visita!',
		changeOwnRole: 'Não pode alterar a sua própria permissão!',
		cogFileNotFound: 'Ficheiro COG não encontrado!'
	},
	api: {
		access: 'Acesso via API',
		generate: 'Gerar',
		keyGenerated: 'Chave de API gerada!',
		key: 'Chave de API',
		errorGenerating: 'Ocorreu um erro ao gerar a chave da API!',
		copied: 'Copiado para a área de transferência!',
		errorUpdating: 'Ocorreu um erro ao atualizar a chave da API!',
		successUpdating: 'Chave de API atualizada com sucesso!',
		noUserFound: 'Nenhum utilizador encontrado com o email fornecido.'
	},
	filters: {
		startYear: 'Ano de Início',
		endYear: 'Ano de Fim',
		postFireMonths: 'Meses Pós-Fogo'
	},
	loading: {
		files: 'A carregar ficheiros...',
		steps: 'A carrergar questionário...',
		load: 'A carregar...',
		file: 'A carregar ficheiro...'
	},
	fireFeature: {
		province: 'Região',
		commune: 'Concelho',
		fireDate: 'Data do Incêndio',
		area: 'Área (hectares)',
		zoom: 'Zoom para a área'
	},
	severity: {
		legend: 'Legenda',
		null: 'Severidade nula / Em recuperação',
		veryLow: 'Muito Baixa',
		low: 'Baixa',
		moderate: 'Moderada',
		high: 'Alta',
		veryHigh: 'Muito Alta'
	},
	map: {
		errors: {
			markers: 'Erro ao carregar marcadores!',
			init: 'Erro ao inicializar o mapa!',
			tiff: 'Erro ao carregar o ficheiro TIFF!'
		}
	},
	download: {
		success: 'Download completo!',
		errors: {
			canceled: 'Download cancelado!',
			unknown: 'Erro desconhecido!'
		}
	},
	wms: {
		general: 'Geral',
		products: 'Produtos',
		file: 'Ficheiro',
		productName: 'Nome do Produto',
		fileName: 'Nome do Ficheiro',
		generalDescription: 'Obter dados de todos os produtos/ficheiros',
		productsDescription: 'Obter os ficheiros de um determinado produto',
		fileDescription: 'Obter os dados de um determinado ficheiro',
		wmsClipboardSuccess: 'URL do WMS copiado para a área de transferência!',
		wmsClipboardError: 'Erro ao copiar URL do WMS para a área de transferência!',
		invalidServiceParameter: "Parâmetro service deve ser 'WMS'",
		operationNotSupported: 'Operação {operation} não suportada',
		internalServerError: 'Erro interno do servidor',
		errorFolders: 'Erro ao obter produtos de dados',
		productNotFound: 'Produto {product} não encontrado',
		errorFiles: 'Erro ao obter ficheiros do produto {product}',
		fileNotFound: 'Ficheiro {file} não encontrado no produto {product}',
		errorGeneratingCapabilities: 'Erro ao gerar capabilities',
		invalidParameters: 'Parâmetros {capability} inválidos ou ausentes',
		layerNotFound: 'Camada {layer} não encontrada',
		errorGeneratingMap: 'Erro ao gerar mapa',
		errorGeneratingLegend: 'Erro ao gerar legenda'
	},
	steps: {
		noResponses: 'O passo {step} não contém respostas!',
		questionAtLeast: 'A pergunta {question} deve ter pelo menos 1 resposta!',
		otherField: "O campo 'Outro' é obrigatório na pergunta {question}!",
		singleResponse: 'A pergunta {question} deve ter apenas uma resposta!',
		countryMandatory: 'O país é obrigatório na pergunta {question}!',
		nuts3Invalid: 'Selecione um NUTS-3 válido!',
		municipalityInvalid: 'Selecione um município válido que pertença à NUTS-3 selecionada!',
		textAreaEmpty: 'A pergunta {question} deve ter uma resposta!',
		textAreaCharacters: 'A resposta da pergunta {question} deve ter no máximo 200 caracteres!'
	}
};

export default pt;
