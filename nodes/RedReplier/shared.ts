import type { ILoadOptionsFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import { redReplierApiRequest } from './transport';

export const MENTION_SOURCE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Bluesky', value: 'BLUESKY' },
	{ name: 'Facebook', value: 'FACEBOOK' },
	{ name: 'Facebook Group', value: 'FACEBOOK_GROUP' },
	{ name: 'Hacker News', value: 'HACKERNEWS' },
	{ name: 'Reddit Comment', value: 'REDDIT_COMMENT' },
	{ name: 'Reddit Post', value: 'REDDIT_POST' },
	{ name: 'X (Twitter)', value: 'TWITTER' },
];

export const MENTION_STATUS_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Approved', value: 'APPROVED' },
	{ name: 'New', value: 'NEW' },
	{ name: 'Rejected', value: 'REJECTED' },
];

export interface Website {
	id: string;
	domain: string;
}

export interface Mention {
	id: string;
	relevanceScore?: number | null;
	[key: string]: unknown;
}

export async function getWebsites(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const { websites } = await redReplierApiRequest.call(this, 'GET', '/websites');
	return (websites as Website[]).map((website) => ({
		name: website.domain,
		value: website.id,
	}));
}

export const websiteSelect = (
	name: string,
	displayOptions: INodeProperties['displayOptions'],
	required = true,
): INodeProperties => ({
	displayName: 'Website Name or ID',
	name,
	type: 'options',
	typeOptions: { loadOptionsMethod: 'getWebsites' },
	required,
	default: '',
	displayOptions,
	description:
		'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
});
