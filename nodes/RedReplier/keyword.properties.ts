import type { INodeProperties } from 'n8n-workflow';

import { websiteSelect } from './shared';

const onlyKeywords = { resource: ['keyword'] };

export const keywordProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: onlyKeywords },
		options: [
			{
				name: 'Add',
				value: 'add',
				action: 'Add keywords to a website',
				routing: {
					request: { method: 'POST', url: '=/websites/{{$parameter.websiteId}}/keywords' },
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a keyword',
				description:
					'Delete a keyword and every mention it found. This cannot be undone. Use Disable to stop monitoring and keep the mentions.',
				routing: {
					request: { method: 'DELETE', url: '=/keywords/{{$parameter.keywordId}}' },
				},
			},
			{
				name: 'Disable',
				value: 'disable',
				action: 'Stop monitoring a keyword',
				routing: {
					request: { method: 'POST', url: '=/keywords/{{$parameter.keywordId}}/disable' },
				},
			},
			{
				name: 'Edit',
				value: 'edit',
				action: 'Change the text of a keyword',
				routing: {
					request: { method: 'PATCH', url: '=/keywords/{{$parameter.keywordId}}' },
				},
			},
			{
				name: 'Enable',
				value: 'enable',
				action: 'Resume monitoring a keyword',
				routing: {
					request: { method: 'POST', url: '=/keywords/{{$parameter.keywordId}}/enable' },
				},
			},
		],
		default: 'add',
	},
	websiteSelect('websiteId', { show: { resource: ['keyword'], operation: ['add'] } }),
	{
		displayName: 'Keywords',
		name: 'keywords',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'social media scheduler, buffer alternative',
		displayOptions: { show: { resource: ['keyword'], operation: ['add'] } },
		description: 'Comma-separated phrases to watch for',
		routing: {
			send: {
				type: 'body',
				property: 'keywords',
				value: '={{ $value.split(",").map((k) => k.trim()).filter(Boolean) }}',
			},
		},
	},
	{
		displayName:
			'Deleting a keyword also deletes every mention it found, with no undo. Use Disable to stop monitoring and keep the mentions.',
		name: 'deleteNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['keyword'], operation: ['delete'] } },
	},
	{
		displayName: 'Keyword ID',
		name: 'keywordId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['keyword'], operation: ['delete', 'disable', 'edit', 'enable'] } },
		description: 'ID from the keywords array of a website',
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['keyword'], operation: ['edit'] } },
		description: 'New text for the keyword',
		routing: { send: { type: 'body', property: 'value' } },
	},
];
