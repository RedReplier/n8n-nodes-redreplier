import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
} from 'n8n-workflow';

export const API_BASE_URL = 'https://ai.redreplier.com/ai-app/api/v1';

export const CREDENTIAL_NAME = 'redReplierApi';

type ApiContext = IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions;

export async function redReplierApiRequest(
	this: ApiContext,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${API_BASE_URL}${path}`,
		qs,
		body,
		json: true,
	};
	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		CREDENTIAL_NAME,
		options,
	)) as IDataObject;
}
