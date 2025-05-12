const en = {
	session: {
		login: 'Login',
		logout: 'Logout',
		profile: 'Profile',
		settings: 'Settings',
		users: 'Users',
		incorrectAccess: 'Incorrect access data!',
		noAccess: 'User without access!',
		forgotPw: 'Forgot password?',
		resetPwInfo:
			'Enter your email and we will send you instructions on how to reset your password.',
		resetPwInstructions: 'Send instructions',
		resetEmailSent: 'Email sent successfully!'
	},
	files: {
		add: 'Add Files',
		nameErrors: 'Some files contain errors, filters may not be applied correctly!',
		dragNdrop: "Drag 'n' drop some files, here, or click to select files",
		successUpload: 'File uploaded successfully!'
	},
	folders: {
		add: 'Add Data Product',
		name: 'Product Name',
		generateName: 'Generate Name',
		invalidName: 'Invalid product name!',
		exists: 'Product already exists!',
		successCreate: 'Product created successfully!'
	},
	titles: {
		data_products: 'Data Products',
		register: 'Sign In',
		products: 'Products',
		help: 'Help',
		info: 'Information',
		resetPw: 'Reset your password',
		howtocite: 'How to Cite',
		versionInfo: 'Version Information',
		data_products_history: 'Data Products History',
		wmsInfo: 'WMS Information'
	},
	buttons: {
		next: 'Next',
		previous: 'Previous'
	},
	municipality: 'municipality',
	country: 'country',
	other: 'other',
	geographic: 'geographic',
	home: 'Home',
	example: 'Example',
	never: 'Never',
	version: {
		add: 'Add Version',
		version: 'Version',
		latestVersion: 'Latest Version',
		noChangesVersion: 'No changes in this version',
		changes_english: 'Changes (English)',
		changes_portuguese: 'Changes (Portuguese)',
		addVersionSuccess: 'Version added successfully!'
	},
	password: {
		rules: 'Password must contain:',
		_length: 'At least 8 characters',
		uppercase: 'At least 1 uppercase letter',
		lowercase: 'At least 1 lowercase letter',
		number: 'At least 1 number',
		specialCharacter: 'At least 1 special character',
		repeat: 'Repeat password',
		match: 'Passwords must match',
		toogle: 'Toggle password visibility',
		rulesFailed: 'Password does not meet the requirements!',
		samePassword: 'The new password must be different from the current one!',
		changed: 'Password changed successfully!'
	},
	forms: {
		fillAllFields: 'Please fill all fields',
		nuts3: 'Please select NUTS-3 first'
	},
	work: 'work',
	register: {
		tokenError: 'Token not found!',
		tokenStillValid: 'You already have a valid token!',
		tokenExpired: 'Token expired!',
		tokenVerified: 'Token verified!',
		invalidQuestionnaire: 'Invalid questionnaire!',
		accountRegistered: 'Account registered successfully!',
		success:
			"Account registered successfully! Please verify your email to confirm the registration. Don't forget to check your spam folder as well!",
		tokenAnswersError: 'Error validating answers!',
		confirmation: 'Register Confirmation',
		validating: 'Validating account...',
		redirect: 'Redirecting...',
		deleteUserError: 'Error deleting user!',
		errorEmailLogin: 'Unable to send email. Please try again later.',
		errorEmailGeneric: 'There was a problem sending the email. Please try again later.',
		genericError: 'There was an unexpected error during processing. Please try again later.',
		tokenVerificationError: 'Error verifying token.',
		answersValidated: 'Answers validated successfully!',
		answerValidationError: 'Error validating answers!'
	},
	user: {
		alreadyExists: 'User already exists!',
		updatedSuccess: 'User updated successfully!',
		updatedError: 'Error updating user!',
		confirmDeleteUser: 'Are you sure you want to delete user: {email}?',
		deleteUser: 'Delete User',
		deletedError: 'Error deleting user!',
		deletedSuccess: 'User deleted successfully!',
		resultsPerPage: 'Results per page',
		searchByEmail: 'Search by email',
		resetFilters: 'Reset Filters',
		showingUsers: 'Showing {start} to {end} of {total} users'
	},
	tables: {
		name: 'Name',
		files: 'Files',
		actions: 'Actions',
		lastUpdate: 'Last Update',
		nodata: 'No data available!',
		viewContent: 'View Content',
		nameDetails: 'Name Details',
		viewMetadata: 'View Metadata',
		openMap: 'Open Map',
		editName: 'Edit Name',
		roleUser: 'Role',
		userCreatedAt: 'Created At',
		userLastSeen: 'Last Seen',
		userSettings: 'User Settings',
		userDelete: 'Delete User'
	},
	actions: {
		save: 'Save',
		download: 'Download',
		upload: 'Upload',
		cancel: 'Cancel',
		edit: 'Edit',
		delete: 'Delete',
		goBackTo: 'Go back to',
		acceptCookies: 'Accept',
		declineCookies: 'Decline'
	},
	errors: {
		version: 'Invalid version number!',
		versionExists: 'Version already exists!',
		addVersion: 'Error adding version!',
		emptyChanges: 'Changes fields cannot be empty!',
		components: 'Invalid number of components!',
		fixFolderName: 'Fix product name to verify files!',
		diffValues: 'Value must be the same as product name!',
		invalidValue: 'Invalid value!',
		unauthorized: 'Unauthorized!',
		folderNotExists: 'Product does not exist!',
		noFiles: 'No files found!',
		fireLoc: 'Fire locations inicialization read error!',
		geoTIFF: 'Image file (GeoTIFF) does not exist!',
		opCode: 'Invalid operation code!',
		markdown: 'Markdown file does not exist!',
		noFileData: 'No file data!',
		occurred: 'An error occurred!',
		missingExtensions: 'Missing Extensions',
		alreadyHaveResetToken: 'User already has a reset token!',
		fetchVersions: 'Error fetching versions!',
		noVersions: 'No versions found!',
		fetchSteps: 'Error fetching questionnaire!',
		invalidEmail: 'Invalid email',
		saveAnswers: 'Error saving questionnaire answers',
		fetchUser: 'Error fetching user!',
		fetchRoles: 'Error fetching roles!',
		deleteUser: 'Error deleting user!',
		insertUser: 'Error saving user!',
		updatePassword: 'Error updating password!',
		updateResetToken: 'Error updating reset token!',
		updateRole: 'Error updating user role!',
		updateApiKey: 'Erro updating api key!',
		deleteAnswers: 'Error deleting questionnaire answers!',
		fetchAnswers: 'Error fetching questionnaire answers!',
		updateAnswersToken: 'Error updating questionnaire answers token!',
		invalidFields: 'Invalid fields!',
		userDataNotFound: 'User data not found!',
		missingFileNames: 'Invalid request! Missing file names!',
		creatingZip: 'Error creating ZIP file!',
		noFileSelected: 'No file selected!',
		somethingWentWrong: 'Something went wrong!',
		errorCreatingRgb: 'Error creating RGB from TIFF!',
		colorMapNotFound: 'Color map not found for {colormap}!',
		errorFetchingResponse: 'Error fetching response!',
		updateLastLogin: 'Error updating last login!',
		changeOwnRole: 'You cannot change your own role!',
		cogFileNotFound: 'COG file not found!'
	},
	api: {
		access: 'API Access',
		generate: 'Generate',
		keyGenerated: 'API Key generated!',
		key: 'API Key',
		errorGenerating: 'An error occurred while generating API key!',
		copied: 'Copied to clipboard!',
		errorUpdating: 'An error occurred while updating API key!',
		successUpdating: 'API Key updated successfully!',
		noUserFound: 'No users found with the email provided.'
	},
	filters: {
		startYear: 'Start Year',
		endYear: 'End Year',
		postFireMonths: 'Post Fire Months'
	},
	loading: {
		files: 'Loading files...',
		steps: 'Loading questionnaire...',
		load: 'Loading...',
		file: 'Loading file...'
	},
	fireFeature: {
		province: 'Province',
		commune: 'Commune',
		fireDate: 'Fire Date',
		area: 'Area (hectares)',
		zoom: 'Zoom to area'
	},
	severity: {
		legend: 'Legend',
		null: 'No severity / In recovery',
		veryLow: 'Very Low',
		low: 'Low',
		moderate: 'Moderate',
		high: 'High',
		veryHigh: 'Very High'
	},
	map: {
		errors: {
			markers: 'Error loading markers!',
			init: 'Error initializing map!',
			tiff: 'Error loading TIFF file!'
		}
	},
	download: {
		success: 'Download completed!',
		errors: {
			canceled: 'Download canceled!',
			unknown: 'Unknown error!'
		}
	},
	wms: {
		general: 'General',
		products: 'Products',
		file: 'File',
		productName: 'Product Name',
		fileName: 'File Name',
		generalDescription: 'Get data from all products/files',
		productsDescription: 'Get the files for a specific product',
		fileDescription: 'Get data from a given file',
		wmsClipboardSuccess: 'WMS URL copied to clipboard!',
		wmsClipboardError: 'Error copying WMS URL to clipboard!',
		invalidServiceParameter: "Service parameter must be 'WMS'",
		operationNotSupported: 'Operation {operation} not supported',
		internalServerError: 'Internal Server Error',
		errorFolders: 'Error fetching data products',
		productNotFound: 'Product {product} not found',
		errorFiles: 'Error fetching files from product {product}',
		fileNotFound: 'File {file} not found in product {product}',
		errorGeneratingCapabilities: 'Error generating capabilities',
		invalidParameters: 'Invalid or missing {capability} parameters',
		layerNotFound: 'Layer {layer} not found',
		errorGeneratingMap: 'Error generating map',
		errorGeneratingLegend: 'Error generating legend'
	},
	steps: {
		noResponses: 'Step {step} has no responses!',
		questionAtLeast: 'Question {question} must have at least 1 response!',
		otherField: 'Other field is required for question {question}!',
		singleResponse: 'Question {question} must have only one response!',
		countryMandatory: 'Country is mandatory for question {question}!',
		nuts3Invalid: 'Select a valid NUTS-3!',
		municipalityInvalid: 'Select a valid municipality that belongs to the selected NUTS-3!',
		textAreaEmpty: 'Question {question} must have a response!',
		textAreaCharacters:
			'The answer to the question {question} must have a maximum of 200 characters!'
	}
};

export default en;
