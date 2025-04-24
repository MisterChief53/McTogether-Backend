import { Module } from '@nestjs/common';
import { WebsocketGateway } from './party.gateway';

@Module({
  providers: [WebsocketGateway],
})
export class GatewayModule {}