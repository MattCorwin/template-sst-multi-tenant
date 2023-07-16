import { Table } from "sst/node/table";
import { ApiHandler } from "sst/node/api";
import { useSession } from "sst/node/auth";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export const getHandler = ApiHandler(async () => {
  const session = useSession();

  // Check user is authenticated
  if (session.type !== "user") {
    throw new Error("Not authenticated");
  }

  const ddb = new DynamoDBClient({});
  const query = new QueryCommand({
    KeyConditionExpression: "tenantID = :tenantID",
    ExpressionAttributeValues: {
      ":tenantID": { S: session.properties.tenantID }
    },
    TableName: Table.documents.tableName,
  });
  const data = await ddb.send(query);
 // userID: session.properties.userID,
  const documents = data.Items?.map((item) => unmarshall(item));
  console.log(`found documents: ${documents}`);

  return {
    statusCode: 200,
    body: JSON.stringify(documents),
  };
});