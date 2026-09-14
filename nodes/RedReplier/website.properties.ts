import type { INodeProperties } from 'n8n-workflow';

import { websiteSelect } from './shared';

const onlyWebsites = { resource: ['website'] };

export const websiteProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: onlyWebsites },
		options: [
			{
				name: 'Analyze Description',
				value: 'analyze',
				action: 'Draft a product description from a URL',
				description: 'Scrape a URL and draft a product description without saving anything',
				routing: {
					request: { method: 'POST', url: '/websites/analyze-description' },
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Start monitoring a website',
				description: 'Start monitoring a website, optionally with a first set of keywords',
				routing: {
					request: { method: 'POST', url: '/websites' },
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Stop monitoring a website',
				routing: {
					request: { method: 'DELETE', url: '=/websites/{{$parameter.websiteId}}' },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a website',
				description: 'Get one monitored website with its keywords',
				routing: {
					request: { method: 'GET', url: '=/websites/{{$parameter.websiteId}}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many websites',
				description: 'List monitored websites with their keywords',
				routing: {
					request: { method: 'GET', url: '/websites' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'websites' } }] },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Rename a website',
				routing: {
					request: { method: 'PATCH', url: '=/websites/{{$parameter.websiteId}}' },
				},
			},
		],
		default: 'getAll',
	},
	websiteSelect('websiteId', { show: { resource: ['website'], operation: ['delete', 'get', 'update'] } }),
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com',
		displayOptions: { show: { resource: ['website'], operation: ['analyze', 'create'] } },
		description: 'Full address of the site, including https',
		routing: { send: { type: 'body', property: 'url' } },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['website'], operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Keywords',
		name: 'keywords',
		type: 'string',
		default: '',
		placeholder: 'social media scheduler, buffer alternative',
		displayOptions: { show: { resource: ['website'], operation: ['create'] } },
		description: 'Comma-separated phrases to watch for. Keywords beyond the plan quota wait as pending.',
		routing: {
			send: {
				type: 'body',
				property: 'keywords',
				value: '={{ $value ? $value.split(",").map((k) => k.trim()).filter(Boolean) : undefined }}',
			},
		},
	},
];
