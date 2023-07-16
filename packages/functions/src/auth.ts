import { AuthHandler, GoogleAdapter, LinkAdapter, Session } from "sst/node/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Table } from "sst/node/table";
import { StaticSite } from "sst/node/site";
import { v4 } from "uuid";
import { UserTypes } from "./types";
import { UsersController } from "./util/usersController";

const GOOGLE_CLIENT_ID = "YOUR-GOOGLE-CLIENT-ID";

declare module "sst/node/auth" {
  export interface SessionTypes {
    user: {
      userID: string;
      tenantID: string;
      userType: UserTypes;
    };
  }
}

export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      mode: "oidc",
      clientID: GOOGLE_CLIENT_ID,
      onSuccess: async (tokenset) => {
        const claims = tokenset.claims();

        // think about db keys
        // think about tenant name as well (will need to prompt for Organization/tenant Name)
        if (!claims.email) {
          return {
            statusCode: 400,
          };
        }

        let dbUser;

        const ddb = new DynamoDBClient({});
        const usersController = new UsersController(ddb, Table.users.tableName);

        dbUser = await usersController.getUser(claims.email, true);

        console.log(
          `past get: ${JSON.stringify(dbUser)}`
        );

        if (!dbUser) {
          console.log("dbUser not found, saving new user");
          dbUser = await usersController.createTenantAdminUser({
            email: claims.email,
            picture: claims.picture!,
            name: claims.given_name!,
            sub: claims.sub,
            tenantID: v4(),
          });
        }

        if (!dbUser?.userID || !dbUser?.tenantID || !dbUser?.userType) {
          return {
            statusCode: 500,
          };
        }

        return Session.parameter({
          redirect: process.env.IS_LOCAL
            ? "http://127.0.0.1:5173"
            : StaticSite.Site.url,
          type: "user",
          properties: {
            userID: dbUser.userID,
            tenantID: dbUser.tenantID,
            userType: dbUser.userType,
          },
          options: {
            expiresIn: 1000 * 60 * 60 * 24
          }
        });
      },
    }),
  },
});
