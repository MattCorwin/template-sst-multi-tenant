import { Table } from "sst/node/table";
import { ApiHandler } from "sst/node/api";
import { useSession } from "sst/node/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UsersController } from "./util/usersController";

export const handler = ApiHandler(async () => {
  const session = useSession();

  // Check user is authenticated
  if (session.type !== "user") {
    throw new Error("Not authenticated");
  }

  const ddb = new DynamoDBClient({});
  const usersController = new UsersController(ddb, Table.users.tableName);
  const user = await usersController.getUser(session.properties.userID);

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
});