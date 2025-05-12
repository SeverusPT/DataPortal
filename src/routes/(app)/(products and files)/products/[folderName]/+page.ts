import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getComponents, type FileInterface } from '$lib/configs';

export const load: PageLoad = async ({ fetch, params, depends, parent }) => {
	let files: FileInterface[] = [];

	depends('folder:products');

	await _fetchFiles(fetch, params.folderName)
		.then((res) => {
			files = res;
		})
		.catch((err) => {
			throw error(404, err.message);
		});

	const versionValues = (await parent()).versionValues;

	const components = await getComponents(versionValues);

	return {
		files: files,
		params,
		components
	};
};

const readFile = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result as string);
		};

		reader.onerror = () => {
			reject(reader.error);
		};

		reader.readAsDataURL(file);
	});
};

export async function _handleFileUpload(
	files: File[],
	fileName: string,
	folderName: string
): Promise<string> {
	return new Promise(async (resolve, reject) => {
		for (const file of files) {
			const fileData = await readFile(file).catch((error) => {
				reject(error);
			});
			const fileExtension = file.name.substring(file.name.indexOf('.') + 1);
			try {
				const response = await fetch('/api/files/upload', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						fileName,
						folderName,
						fileData,
						fileExtension
					})
				});
				if (response.ok) {
					const res = await response.json();
					resolve(res.message);
				} else {
					const error = await response.json();
					reject(error.message);
				}
			} catch (error) {
				reject(error.message);
			}
		}
	});
}

export async function _fetchFiles(fetch, folderName: string, method?: string) {
	const buildUrl = (folderName: string, method: any) => {
		const params = method ? `?${new URLSearchParams({ method }).toString()}` : '';
		return `/api/files/fetch/${folderName}${params}`;
	};

	const handleResponse = async (response) => {
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}
		return response.json();
	};

	try {
		const url = buildUrl(folderName, method);
		const response = await fetch(url);
		return await handleResponse(response);
	} catch (error) {
		throw error;
	}
}

export async function _parseMarkdown(fetch, folderName: string, fileName: string, method: string) {
	let res = await fetch(`/api/files/markdown`, {
		method: 'POST',
		body: JSON.stringify({ folderName, fileName, method })
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message);
	} else {
		const data = await res.json();
		return data;
	}
}

export async function _existsTiffFile(
	fetch,
	folderName: string,
	fileName: string,
	method?: string
) {
	let url = `/api/files/getTIFF?op=exists&fld=${folderName}&file=${fileName}`;

	if (method) {
		url += `&method=${method}`;
	}

	let res = await fetch(url, { method: 'GET' });

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message);
	} else {
		const data = await res.json();
		return data;
	}
}
