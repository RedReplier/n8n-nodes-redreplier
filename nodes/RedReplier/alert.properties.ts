import type { INodeProperties } from 'n8n-workflow';

const onlyAlerts = { resource: ['alertSettings'] };

export const alertProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: onlyAlerts },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get email alert settings',
				routing: {
					request: { method: 'GET', url: '/alert-settings' },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update email alert settings',
				description: 'Turn email alerts on or off and set the cadence',
				routing: {
					request: { method: 'PUT', url: '/alert-settings' },
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Enabled',
		name: 'enabled',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['alertSettings'], operation: ['update'] } },
		description: 'Whether RedReplier emails a digest of new mentions',
		routing: { send: { type: 'body', property: 'enabled' } },
	},
	{
		displayName: 'Cadence (Minutes)',
		name: 'cadenceMinutes',
		type: 'options',
		options: [
			{ name: 'Every 15 Minutes', value: 15 },
			{ name: 'Every 30 Minutes', value: 30 },
			{ name: 'Every Hour', value: 60 },
			{ name: 'Every 2 Hours', value: 120 },
			{ name: 'Every 3 Hours', value: 180 },
			{ name: 'Every 4 Hours', value: 240 },
			{ name: 'Every 12 Hours', value: 720 },
			{ name: 'Every 24 Hours', value: 1440 },
		],
		default: 720,
		displayOptions: { show: { resource: ['alertSettings'], operation: ['update'] } },
		description: 'Clamped up to the fastest cadence the plan allows',
		routing: { send: { type: 'body', property: 'cadenceMinutes' } },
	},
];
