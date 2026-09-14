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
const REMEMBERED_IDS = 1000;

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
			statuses: ['NEW'],
			sort: 'RECENT',
			limit: 100,
		};

		const { mentions } = await redReplierApiRequest.call(this, 'GET', '/mentions', undefined, qs);
		const relevant = (mentions as Mention[]).filter(
			(mention) => (mention.relevanceScore ?? 0) >= minScore,
		);

		if (this.getMode() === 'manual') {
			const sample = relevant.slice(0, MANUAL_SAMPLE_SIZE);
			return sample.length ? [this.helpers.returnJsonArray(sample as IDataObject[])] : null;
		}

		const firstRun = staticData.seenIds === undefined;
		const fresh = relevant.filter((mention) => !seenIds.includes(mention.id));
		staticData.seenIds = [...fresh.map((mention) => mention.id), ...seenIds].slice(
			0,
			REMEMBERED_IDS,
		);

		if (firstRun || fresh.length === 0) {
			return null;
		}
		return [this.helpers.returnJsonArray(fresh as IDataObject[])];
	}
}
