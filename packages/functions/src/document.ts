import { Table } from "sst/node/table";
import { ApiHandler } from "sst/node/api";
import { useSession } from "sst/node/auth";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 } from "uuid";

export const postHandler = ApiHandler(async (event) => {
  const session = useSession();
  console.log(JSON.stringify(event));
  // Check user is authenticated
  if (session.type !== "user") {
    throw new Error("Not authenticated");
  }
  if (!event.body) {
    throw new Error("Empty event body");
  }
  const ddb = new DynamoDBClient({});
  const document = await createDocument({
    tenantID: session.properties.tenantID,
    body: event.body,
    db: ddb,
    table: Table.documents.tableName,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(document),
  };
});

const createDocument = async (params: {
  tenantID: string;
  body: string;
  db: DynamoDBClient;
  table: string;
}) => {
  const document = {
    tenantID: params.tenantID,
    body: params.body,
    documentID: v4(),
  };
  await params.db.send(
    new PutItemCommand({
      TableName: params.table,
      Item: marshall(document),
      ReturnValues: "NONE",
    })
  );
  return document;
};
