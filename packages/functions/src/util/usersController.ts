import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { IUser, UserTypes } from "../types";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class UsersController {
  private db: DynamoDBClient;
  private tableName: string;

  constructor(db: DynamoDBClient, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  public async getUser(email: string, strong: boolean = false): Promise<IUser | undefined> {
    let unmarshalled;
    try {
      const dbUser = await this.db.send(
        new GetItemCommand({
          TableName: this.tableName,
          Key: marshall({
            userID: email,
          }),
          ConsistentRead: strong,
        })
      );
      if (dbUser.Item) {
        unmarshalled = unmarshall(dbUser.Item) as IUser;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return unmarshalled;
  }

  public async createTenantAdminUser(params: {
    email: string;
    picture: string;
    name: string;
    sub: string;
    tenantID: string;
  }): Promise<IUser> {
    const user: IUser = {
      ...params,
      userType: UserTypes.TenantAdmin,
      userID: params.email,
    };
    await this.db.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(user),
        ReturnValues: "NONE",
      })
    );
    return user;
  }
}
