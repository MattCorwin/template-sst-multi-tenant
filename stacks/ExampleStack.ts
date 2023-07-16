import { StackContext, Api, Auth, StaticSite, Table } from "sst/constructs";

export function ExampleStack({ stack }: StackContext) {
  const table = new Table(stack, "users", {
    fields: {
      userID: "string",
      tenantID: "string",
    },
    primaryIndex: { partitionKey: "userID" },
  });  // could add tenantID as sort key if allowing one to many userID to tenantID

  const docsTable = new Table(stack, "documents", {
    fields: {
      tenantID: "string",
      documentID: "string",
    },
    primaryIndex: { partitionKey: "tenantID", sortKey: "documentID" },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [table, docsTable],
      },
    },
    routes: {
      "GET /session": "packages/functions/src/session.handler",
      "GET /documents": "packages/functions/src/documents.getHandler",
      "POST /document": "packages/functions/src/document.postHandler"
    },
  });

  const site = new StaticSite(stack, "Site", {
    path: "web",
    buildCommand: "npm run build",
    buildOutput: "dist",
    environment: {
      VITE_APP_API_URL: api.url,
    },
  });

  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
      bind: [site]
    },
  });

  auth.attach(stack, {
    api,
    prefix: "/auth",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    SiteURL: site.url,
  });
}
