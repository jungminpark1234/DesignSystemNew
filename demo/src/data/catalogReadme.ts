// Condensed README content for each catalog item (sourced from GitHub repos)

export interface CatalogItemData {
  id: string;
  title: string;
  desc: string;
  appId: string;
  createdAt: string;
  readme: string;
}

export const CATALOG_README: Record<string, CatalogItemData> = {
  chroma: {
    id: "chroma",
    title: "Chroma DB",
    desc: "Open-source AI-native embedding database for building AI applications with embeddings",
    appId: "runway-chroma",
    createdAt: "2025-09-12",
    readme: `# Chroma

**Chroma - the open-source data infrastructure for AI.**

[Docs](https://docs.trychroma.com/) | [Homepage](https://www.trychroma.com/)

## Installation

\`\`\`bash
pip install chromadb # python client
# for javascript, npm install chromadb!
# for client-server mode, chroma run --path /chroma_db_path
\`\`\`

## Key Features

- Simple 4-function core API
- Automatic tokenization, embedding, and indexing
- Metadata filtering and document filtering
- In-memory mode for prototyping, with easy persistence
- Python and JavaScript clients
- Client-server mode for production

## Quickstart

\`\`\`python
import chromadb

# Setup Chroma in-memory, for easy prototyping
client = chromadb.Client()

# Create collection
collection = client.create_collection("all-my-documents")

# Add docs to the collection
collection.add(
    documents=["This is document1", "This is document2"],
    metadatas=[{"source": "notion"}, {"source": "google-docs"}],
    ids=["doc1", "doc2"],
)

# Query/search 2 most similar results
results = collection.query(
    query_texts=["This is a query document"],
    n_results=2,
)
\`\`\`

## Chroma Cloud

Chroma Cloud powers serverless vector, hybrid, and full-text search. Create a DB and try it out in under 30 seconds.

## Contributing

- [Join the conversation on Discord](https://discord.com/invite/chromadb)
- [Grab an issue and open a PR](https://github.com/chroma-core/chroma/issues)

## License

[Apache 2.0](https://github.com/chroma-core/chroma/blob/master/LICENSE)
`,
  },

  codeserver: {
    id: "codeserver",
    title: "Code server",
    desc: "Run VS Code on any machine anywhere and access it in the browser",
    appId: "runway-codeserver",
    createdAt: "2025-08-20",
    readme: `# code-server

Run [VS Code](https://github.com/Microsoft/vscode) on any machine anywhere and access it in the browser.

## Highlights

- Code on any device with a consistent development environment
- Use cloud servers to speed up tests, compilations, downloads, and more
- Preserve battery life when you're on the go; all intensive tasks run on your server

## Requirements

- Linux machine with WebSockets enabled
- 1 GB RAM and 2 vCPUs minimum

See [requirements](https://coder.com/docs/code-server/latest/requirements) for detailed specs and setup instructions.

## Getting Started

There are five ways to get started:

1. Using the [install script](https://github.com/coder/code-server/blob/main/install.sh), which automates most of the process
2. Manually [installing code-server](https://coder.com/docs/code-server/latest/install)
3. Deploy code-server to your team with [coder/coder](https://cdr.co/coder-github)
4. Using one-click buttons to [deploy to a cloud provider](https://github.com/coder/deploy-code-server)
5. Using the [code-server devcontainer feature](https://github.com/coder/devcontainer-features/blob/main/src/code-server/README.md)

### Quick Install

Preview the install process:

\`\`\`bash
curl -fsSL https://code-server.dev/install.sh | sh -s -- --dry-run
\`\`\`

Install code-server:

\`\`\`bash
curl -fsSL https://code-server.dev/install.sh | sh
\`\`\`

## For Teams

We develop [coder/coder](https://cdr.co/coder-github) to help teams adopt remote development.

## License

[MIT](https://github.com/coder/code-server/blob/main/LICENSE)
`,
  },

  jupyterlab: {
    id: "jupyterlab",
    title: "JupyterLab",
    desc: "Extensible environment for interactive and reproducible computing, the next-gen Jupyter Notebook UI",
    appId: "runway-jupyterlab",
    createdAt: "2025-07-15",
    readme: `# JupyterLab

An extensible environment for interactive and reproducible computing, based on the Jupyter Notebook and Architecture.

[JupyterLab](http://jupyterlab.readthedocs.io/en/stable/) is the next-generation user interface for [Project Jupyter](https://jupyter.org) offering all the familiar building blocks of the classic Jupyter Notebook (notebook, terminal, text editor, file browser, rich outputs, etc.) in a flexible and powerful user interface.

JupyterLab can be extended using [npm](https://www.npmjs.com/) packages that use our public APIs.

## Installation

\`\`\`bash
# Using conda
conda install -c conda-forge jupyterlab

# Using mamba
mamba install -c conda-forge jupyterlab

# Using pip
pip install jupyterlab
\`\`\`

## Running

Start up JupyterLab using:

\`\`\`bash
jupyter lab
\`\`\`

JupyterLab will open automatically in the browser.

## Supported Browsers

The latest versions of the following browsers are currently known to work:

- Firefox
- Chrome
- Safari

## Key Features

- Notebooks, terminals, text editors, file browser, rich outputs
- Flexible, extensible plugin architecture
- Supports prebuilt and source extensions
- Real-time collaboration capabilities
- Multiple document interface with drag-and-drop

## Getting Help

- [Discourse Forum](https://discourse.jupyter.org/c/jupyterlab)
- [Bug Reports](https://github.com/jupyterlab/jupyterlab/issues)

## License

[Revised BSD License](https://github.com/jupyterlab/jupyterlab/blob/main/LICENSE)
`,
  },

  langflow: {
    id: "langflow",
    title: "Langflow",
    desc: "Visual framework for building and deploying AI-powered agents and workflows",
    appId: "runway-langflow",
    createdAt: "2025-11-02",
    readme: `# Langflow

A powerful platform for building and deploying AI-powered agents and workflows. Langflow provides developers with both a visual authoring experience and built-in API and MCP servers.

## Key Features

- **Visual Development**: Drag-and-drop interface for rapid prototyping and iteration
- **Source Code Access**: Customize any component with Python
- **Interactive Playground**: Step-by-step debugging with granular control
- **Multi-Agent Orchestration**: Conversation and retrieval management for complex workflows
- **Flexible Deployment**: Deploy as API, export as JSON, or deploy as MCP server
- **Observability**: Integration with LangSmith, LangFuse, and similar tools
- **Enterprise Ready**: Built-in security features and scalability

## Requirements

- Python 3.10 to 3.13
- [uv](https://docs.astral.sh/uv/) package manager

## Getting Started

### Install with pip

\`\`\`bash
uv pip install langflow -U
\`\`\`

### Run Langflow

\`\`\`bash
uv run langflow run
\`\`\`

Langflow will be available at \`http://127.0.0.1:7860\`.

### Docker

\`\`\`bash
docker run -d -p 7860:7860 langflowai/langflow:latest
\`\`\`

## Community

- [Discord](https://discord.gg/langflow)
- [Contributing Guide](https://github.com/langflow-ai/langflow/blob/main/CONTRIBUTING.md)

## License

MIT License
`,
  },

  milvus: {
    id: "milvus",
    title: "Milvus",
    desc: "High-performance vector database built for scale, powering AI applications with vector search",
    appId: "runway-milvus",
    createdAt: "2025-10-05",
    readme: `# Milvus

[Milvus](https://milvus.io/) is a high-performance vector database built for scale. It powers AI applications by efficiently organizing and searching vast amounts of unstructured data, such as text, images, and multi-modal information.

Written in Go and C++, Milvus implements hardware acceleration for CPU/GPU to achieve best-in-class vector search performance.

## Key Features

- **High Performance at Scale**: Distributed architecture separating compute and storage, horizontal scaling
- **Multiple Index Types**: HNSW, IVF, FLAT, SCANN, DiskANN with quantization and GPU indexing
- **Flexible Multi-tenancy**: Database, collection, partition, or partition key level isolation
- **Full Text & Hybrid Search**: BM25, sparse embeddings combined with dense vector search
- **Data Security**: User authentication, TLS encryption, Role-Based Access Control (RBAC)

## Quickstart

\`\`\`bash
pip install -U pymilvus
\`\`\`

\`\`\`python
from pymilvus import MilvusClient

# Use Milvus Lite for local development
client = MilvusClient("milvus_demo.db")

# Create collection
client.create_collection(
    collection_name="demo_collection",
    dimension=768,
)

# Insert data
res = client.insert(collection_name="demo_collection", data=data)

# Vector search
res = client.search(
    collection_name="demo_collection",
    data=query_vectors,
    limit=2,
    output_fields=["vector", "text", "subject"],
)
\`\`\`

## Ecosystem & Integrations

Integrates with LangChain, LlamaIndex, OpenAI, HuggingFace, and more. Includes tools like Attu (GUI), Birdwatcher (debugging), Prometheus/Grafana (monitoring).

## Documentation

- [Milvus Docs](https://milvus.io/docs)
- [Tutorials Overview](https://milvus.io/docs/tutorials-overview.md)

## License

[Apache 2.0](https://github.com/milvus-io/milvus/blob/master/LICENSE)
`,
  },

  qdrant: {
    id: "qdrant",
    title: "Qdrant",
    desc: "Vector similarity search engine and database built in Rust for production AI applications",
    appId: "runway-qdrant",
    createdAt: "2025-09-28",
    readme: `# Qdrant - Vector Search Engine

Qdrant (read: quadrant) is a vector similarity search engine and vector database. It provides a production-ready service with a convenient API to store, search, and manage vectors with additional payload and extended filtering support.

Qdrant makes it useful for all sorts of neural-network or semantic-based matching, faceted search, and other applications.

## Key Features

- **Payload Filtering**: Attach JSON payloads to vectors and filter with keyword, full-text, numerical range, and geo-location queries
- **Sparse Vectors**: Hybrid search combining dense and sparse vectors (generalization of BM25/TF-IDF)
- **Vector Quantization**: Reduce RAM usage up to 97% with configurable speed-precision tradeoffs
- **Distributed Deployment**: Horizontal scaling via sharding and replication with zero-downtime updates
- **Performance Optimized**: SIMD hardware acceleration, async I/O with io_uring, write-ahead logging
- **REST and gRPC APIs**: Two interface options for flexibility

## Getting Started

### Python (Local/In-Memory)

\`\`\`bash
pip install qdrant-client
\`\`\`

\`\`\`python
from qdrant_client import QdrantClient

# In-memory for testing
client = QdrantClient(":memory:")

# Or persist to disk
client = QdrantClient(path="path/to/db")
\`\`\`

### Docker (Client-Server)

\`\`\`bash
docker run -p 6333:6333 qdrant/qdrant
\`\`\`

\`\`\`python
client = QdrantClient(url="http://localhost:6333")
\`\`\`

## Client Libraries

| Language | Repository |
|----------|------------|
| Python | python-client |
| Rust | rust-client |
| Go | go-client |
| JavaScript/TypeScript | js-client |
| .NET/C# | dotnet-client |
| Java | java-client |

## Integrations

Qdrant integrates with LangChain, LlamaIndex, Haystack, Cohere, OpenAI ChatGPT Retrieval Plugin, and Microsoft Semantic Kernel.

## License

[Apache License 2.0](https://github.com/qdrant/qdrant/blob/master/LICENSE)
`,
  },

  airflow: {
    id: "airflow",
    title: "Airflow (Managed)",
    desc: "Data workflow orchestration dashboard for programmatically authoring, scheduling, and monitoring workflows",
    appId: "runway-airflow",
    createdAt: "2025-10-18",
    readme: `# Apache Airflow

Apache Airflow (or simply Airflow) is a platform to programmatically author, schedule, and monitor workflows.

When workflows are defined as code, they become more maintainable, versionable, testable, and collaborative.

Use Airflow to author workflows as Directed Acyclic Graphs (DAGs) of tasks. The Airflow scheduler executes your tasks on an array of workers while following the specified dependencies. Rich command line utilities make performing complex surgeries on DAGs a snap. The rich user interface makes it easy to visualize pipelines running in production, monitor progress, and troubleshoot issues when needed.

## Key Concepts

### Dynamic

Airflow pipelines are configuration as code (Python), allowing for dynamic pipeline generation. This allows for writing code that instantiates pipelines dynamically.

### Extensible

Easily define your own operators, executors and extend the library so that it fits the level of abstraction that suits your environment.

### Flexible

Workflow parameterization is built-in leveraging the [Jinja](https://jinja.palletsprojects.com) templating engine.

## Requirements

Apache Airflow is tested with:

| Category        | Supported                                         |
|-----------------|---------------------------------------------------|
| Python          | 3.9, 3.10, 3.11, 3.12                            |
| Databases       | PostgreSQL: 12, 13, 14, 15, 16, 17               |
|                 | MySQL: 8.0, Innovation                            |
|                 | SQLite: 3.15.0+                                   |
| Kubernetes      | 1.28, 1.29, 1.30, 1.31, 1.32                     |

## Getting started

Visit the official Airflow website documentation (latest **stable** release) for help with
[installing Airflow](https://airflow.apache.org/docs/apache-airflow/stable/installation/),
[getting started](https://airflow.apache.org/docs/apache-airflow/stable/start.html), or walking
through a more complete [tutorial](https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html).

## Installing from PyPI

\`\`\`bash
pip install apache-airflow
\`\`\`

## Official source code

Apache Airflow is an [Apache Software Foundation](https://www.apache.org) (ASF) project,
and our official source code releases follow the [ASF Release Policy](https://www.apache.org/legal/release-policy.html).

## Contributing

Want to help build Apache Airflow? Check out our [contributing documentation](https://github.com/apache/airflow/blob/main/contributing-docs/README.rst).

## Who uses Apache Airflow?

More than 500 organizations are using Apache Airflow
[in the wild](https://github.com/apache/airflow/blob/main/INTHEWILD.md).
`,
  },
};
