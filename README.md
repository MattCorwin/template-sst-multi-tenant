template-sst-multi-tenant

This repo was based initially off of this tutorial: https://sst.dev/examples/how-to-add-google-login-to-your-sst-apps.html
It contains instructions for setting up Auth via Google.

It uses SST to create a repo that includes:
- A React single spa UI
- Lambdas for handling auth via Google
- A users table and handling for fetching/retrieving users
- A Lambda for fetching a session token
- Infrastructure for creating and retrieving a 'document' scoped to the tenant
- Session token handling UI side

To get set up, you will need the AWS CLI installed, and your CLI user role will need to have the regular amplify permissions along with ecr:* and iot:* permissions before running npm run dev.

To run locally:
- npm install
- npm run dev in the root folder (this provisions resources in your AWS account for a feature branch)
- in a separate shell, cd web && npm run dev (runs the UI locally)

To deploy via github actions:
- copy the contents of the githubActions-moveThis folder to the project root
- add your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to the secrets in your repo (ensure these are kept private!)