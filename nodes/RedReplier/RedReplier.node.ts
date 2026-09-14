import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { alertProperties } from './alert.properties';
import { keywordProperties } from './keyword.properties';
import { mentionProperties } from './mention.properties';
import { getWebsites } from './shared';
import { API_BASE_URL } from './transport';
import { websiteProperties } from './website.properties';

export class RedReplier implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RedReplier',
		name: 'redReplier',
		icon: { light: 'file:../../icons/redreplier.svg', dark: 'file:../../icons/redreplier.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Find and manage Reddit, X, Bluesky and Hacker News mentions with RedReplier',
		defaults: {
			name: 'RedReplier',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'redReplierApi', required: true }],
		requestDefaults: {
			baseURL: API_BASE_URL,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Alert Setting', value: 'alertSettings' },
					{ name: 'Keyword', value: 'keyword' },
					{ name: 'Mention', value: 'mention' },
					{ name: 'Website', value: 'website' },
				],
				default: 'mention',
			},
			...alertProperties,
			...keywordProperties,
			...mentionProperties,
			...websiteProperties,
		],
	};

	methods = {
		loadOptions: {
			getWebsites,
		},
	};
}
