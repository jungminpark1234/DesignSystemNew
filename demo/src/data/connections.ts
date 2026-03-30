export interface Connection {
  name: string;
  connId: string;
  host: string;
  connected: boolean;
}

export const CONNECTIONS: Connection[] = [
  { name: "Aurora DB",     connId: "gcp-conn-001",   host: "analytics-db.internal:5432",          connected: false },
  { name: "Cassandra",     connId: "aws-conn-002",   host: "us-east-1",                           connected: true  },
  { name: "Athena Query",  connId: "azure-conn-003", host: "http://mlflow.internal:5000",         connected: true  },
  { name: "BigQuery",      connId: "ms-sql-004",     host: "firehose.internal:8080",              connected: false },
  { name: "DynamoDB",      connId: "maria-db-005",   host: "us-west-2",                           connected: false },
  { name: "ElasticSearch", connId: "vertica-006",    host: "ws://spark.internal:4040",            connected: true  },
  { name: "HBase",         connId: "hana-007",       host: "jdbc:oracle:thin:@localhost:1521:xe", connected: false },
  { name: "Kafka",         connId: "redshift-008",   host: "localhost:5432",                      connected: true  },
  { name: "Kinesis",       connId: "snowflake-009",  host: "10.1.1.5:9200",                       connected: false },
  { name: "MongoDB",       connId: "teradata-010",   host: "zookeeper.internal:2181",             connected: true  },
];

export const CURRENT_USER = { name: "홍길동", email: "gildong.hong@makinarocks.ai" };

export function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts = local.split(".");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : local.slice(0, 2).toUpperCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Name is required";
  if (name.length > 128) return "Name must not exceed 128 characters";
  return null;
}

export function validateConnId(id: string, existingIds: string[] = []): string | null {
  if (!id) return "Connection ID is required";
  if (id.length < 3) return "Connection ID must be at least 3 characters";
  if (!/^[a-z0-9-]+$/.test(id)) return "Connection ID must contain only lowercase letters, numbers, and hyphens";
  if (!/^[a-z0-9]/.test(id)) return "Connection ID must start with a lowercase letter or number";
  if (!/[a-z0-9]$/.test(id)) return "Connection ID must end with a lowercase letter or number";
  if (existingIds.includes(id)) return "Connection ID already exists. Please choose a different ID.";
  return null;
}
