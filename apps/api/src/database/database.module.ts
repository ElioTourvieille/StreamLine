import { Global, Module } from '@nestjs/common'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const DYNAMO_CLIENT = 'DYNAMO_CLIENT'

@Global()
@Module({
  providers: [
    {
      provide: DYNAMO_CLIENT,
      useFactory: () => {
        const client = new DynamoDBClient({
          region: process.env.AWS_REGION ?? 'eu-central-2',
          ...(process.env.DYNAMODB_ENDPOINT
            ? { endpoint: process.env.DYNAMODB_ENDPOINT }
            : {}),
        })
        return DynamoDBDocumentClient.from(client, {
          marshallOptions: { removeUndefinedValues: true },
        })
      },
    },
  ],
  exports: [DYNAMO_CLIENT],
})
export class DatabaseModule {}

export { DYNAMO_CLIENT }
