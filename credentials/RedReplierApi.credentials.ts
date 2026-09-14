import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RedReplierApi implements ICredentialType {
	name = 'redReplierApi';

	displayName = 'RedReplier API';

	icon: Icon = { light: 'file:../icons/redreplier.svg', dark: 'file:../icons/redreplier.dark.svg' };

	documentationUrl =
		'https://github.com/RedReplier/n8n-nodes-redreplier?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Workspace token from redreplier.com/api-tokens. It starts with redreplier_.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://ai.redreplier.com/ai-app/api/v1',
			url: '/websites',
		},
	};
}
