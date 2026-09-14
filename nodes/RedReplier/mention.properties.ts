import type { INodeProperties } from 'n8n-workflow';

import { MENTION_SOURCE_OPTIONS, MENTION_STATUS_OPTIONS, websiteSelect } from './shared';

const onlyMentions = { resource: ['mention'] };
const listOrCount = { resource: ['mention'], operation: ['count', 'getAll'] };

export const mentionProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: onlyMentions },
		options: [
			{
				name: 'Count',
				value: 'count',
				action: 'Count mentions',
				description: 'Count matched conversations for a set of filters',
				routing: {
					request: { method: 'GET', url: '/mentions/count' },
				},
			},
			{
				name: 'Explain',
				value: 'explain',
				action: 'Explain a mention',
				description: 'Ask why a mention scored the way it did and draft a reply',
				routing: {
					request: { method: 'POST', url: '=/mentions/{{$parameter.mentionId}}/explain' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many mentions',
				description: 'List matched conversations, newest first',
				routing: {
					request: { method: 'GET', url: '/mentions', qs: { sort: 'RECENT' } },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'mentions' } }] },
				},
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				action: 'Approve or reject a mention',
				routing: {
					request: { method: 'PATCH', url: '=/mentions/{{$parameter.mentionId}}/status' },
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Mention ID',
		name: 'mentionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['mention'], operation: ['explain', 'updateStatus'] } },
		description: 'Usually mapped from the RedReplier Trigger',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: MENTION_STATUS_OPTIONS,
		default: 'APPROVED',
		displayOptions: { show: { resource: ['mention'], operation: ['updateStatus'] } },
		routing: { send: { type: 'body', property: 'status' } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 50,
		displayOptions: { show: { resource: ['mention'], operation: ['getAll'] } },
		description: 'Max number of results to return',
		routing: { send: { type: 'query', property: 'limit' } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: listOrCount },
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Only mentions published at or after this time',
				routing: { send: { type: 'query', property: 'from' } },
			},
			{
				displayName: 'Include Low Relevance',
				name: 'includeLowRelevance',
				type: 'boolean',
				default: false,
				description: 'Whether to include mentions RedReplier scored as low relevance',
				routing: { send: { type: 'query', property: 'includeLowRelevance' } },
			},
			{
				displayName: 'Keywords',
				name: 'keywords',
				type: 'string',
				default: '',
				description: 'Comma-separated monitored keywords the mention must have matched',
				routing: {
					send: {
						type: 'query',
						property: 'keywords',
						value: '={{ $value.split(",").map((k) => k.trim()).filter(Boolean) }}',
					},
				},
			},
			{
				displayName: 'Sources',
				name: 'sources',
				type: 'multiOptions',
				options: MENTION_SOURCE_OPTIONS,
				default: [],
				routing: { send: { type: 'query', property: 'sources' } },
			},
			{
				displayName: 'Statuses',
				name: 'statuses',
				type: 'multiOptions',
				options: MENTION_STATUS_OPTIONS,
				default: [],
				routing: { send: { type: 'query', property: 'statuses' } },
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Only mentions published at or before this time',
				routing: { send: { type: 'query', property: 'to' } },
			},
			{
				...websiteSelect('websiteId', undefined, false),
				routing: { send: { type: 'query', property: 'websiteId' } },
			},
		],
	},
];
