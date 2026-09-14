# n8n-nodes-redreplier

n8n community node for [RedReplier](https://redreplier.com). Start workflows when RedReplier finds a new Reddit, X, Bluesky, Hacker News or Facebook conversation that matches your keywords, and manage monitored websites, keywords and alert settings from a workflow.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The package name is `n8n-nodes-redreplier`.

## Nodes

### RedReplier

| Resource | Operations |
| --- | --- |
| Mention | Get Many, Count, Update Status, Explain |
| Website | Create, Get, Get Many, Update, Delete, Analyze Description |
| Keyword | Add, Edit, Enable, Disable, Delete |
| Alert Settings | Get, Update |

Get Many and Count accept filters for website, source, keyword, status, date range and low-relevance mentions. Explain asks RedReplier why a mention scored the way it did and returns a drafted reply, cached on the mention.

### RedReplier Trigger

Polls `GET /mentions` on the schedule you pick in n8n and emits mentions it has not seen before. Filters: website, sources, minimum relevance score, include low relevance. The first poll after activation only records what already exists, so old mentions do not flood the workflow. Fetch Test Event returns the latest three matching mentions.

## Credentials

Create a workspace token at [redreplier.com/api-tokens](https://redreplier.com/api-tokens). It starts with `redreplier_`. Paste it into the RedReplier API credential in n8n. n8n tests the credential with a request to `GET /websites`.

## Compatibility

Tested with n8n 1.100 and later.

## Resources

- [RedReplier API reference](https://redreplier.com/docs/api-introduction)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
