import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { getWebsites, MENTION_SOURCE_OPTIONS, type Mention } from './shared';
import { redReplierApiRequest } from './transport';

const MANUAL_SAMPLE_SIZE = 3;
const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const REMEMBERED_IDS = 2000;
// Mentions are scored after ingestion, so one can pass the filters well after its ingestedAt.
const INGESTION_OVERLAP_MS = 60 * 60 * 1000;

export class RedReplierTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RedReplier Trigger',
		name: 'redReplierTrigger',
		icon: { light: 'file:../../icons/redreplier.svg', dark: 'file:../../icons/redreplier.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: 'New Mention',
		description: 'Starts the workflow when RedReplier finds a new mention',
		defaults: {
			name: 'RedReplier Trigger',
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'redReplierApi', required: true }],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'New Mention', value: 'newMention' }],
				default: 'newMention',
			},
			{
				displayName: 'Website Name or ID',
				name: 'websiteId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getWebsites' },
				default: '',
				description:
					'Leave empty to watch every monitored website. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Sources',
				name: 'sources',
				type: 'multiOptions',
				options: MENTION_SOURCE_OPTIONS,
				default: [],
				description: 'Leave empty for every source',
			},
			{
				displayName: 'Minimum Relevance Score',
				name: 'minScore',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 100 },
				default: 0,
				description: 'Skip mentions scored below this number',
			},
			{
				displayName: 'Include Low Relevance',
				name: 'includeLowRelevance',
				type: 'boolean',
				default: false,
				description: 'Whether to include mentions RedReplier scored as low relevance',
			},
		],
	};

	methods = {
		loadOptions: {
			getWebsites,
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const staticData = this.getWorkflowStaticData('node');
		const seenIds = (staticData.seenIds as string[] | undefined) ?? [];
		const minScore = this.getNodeParameter('minScore', 0) as number;
		const qs: IDataObject = {
			websiteId: this.getNodeParameter('websiteId', '') || undefined,
			sources: this.getNodeParameter('sources', []),
			includeLowRelevance: this.getNodeParameter('includeLowRelevance', false),
			minScore: minScore > 0 ? minScore : undefined,
			statuses: ['NEW'],
			sort: 'RECENT',
		};

		if (this.getMode() === 'manual') {
			const { mentions } = await redReplierApiRequest.call(this, 'GET', '/mentions', undefined, {
				...qs,
				limit: MANUAL_SAMPLE_SIZE,
			});
			const sample = mentions as Mention[];
			return sample.length ? [this.helpers.returnJsonArray(sample as IDataObject[])] : null;
		}

		const pollStartedAt = Date.now();
		const lastPollAt = (staticData.lastPollAt as number | undefined) ?? pollStartedAt;
		qs.from = new Date(lastPollAt - INGESTION_OVERLAP_MS).toISOString();

		const found: Mention[] = [];
		for (let page = 0; page < MAX_PAGES; page++) {
			const { mentions } = await redReplierApiRequest.call(this, 'GET', '/mentions', undefined, {
				...qs,
				limit: PAGE_SIZE,
				offset: page * PAGE_SIZE,
			});
			const batch = mentions as Mention[];
			found.push(...batch);
			if (batch.length < PAGE_SIZE) break;
		}

		const firstRun = staticData.seenIds === undefined;
		const fresh = found.filter((mention) => !seenIds.includes(mention.id));
		staticData.seenIds = [...fresh.map((mention) => mention.id), ...seenIds].slice(
			0,
			REMEMBERED_IDS,
		);
		staticData.lastPollAt = pollStartedAt;

		if (firstRun || fresh.length === 0) {
			return null;
		}
		return [this.helpers.returnJsonArray(fresh as IDataObject[])];
	}
}
