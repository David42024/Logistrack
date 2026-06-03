import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('OrdersGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
    return { event: 'joined', data: room };
  }

  emitOrderCreated(order: any) {
    this.server.emit('order-created', order);
  }

  emitOrderStatusUpdated(order: any) {
    this.server.emit('order-status-updated', order);
    if (order.driverId) {
      this.server.to(`driver-${order.driverId}`).emit('order-status-updated', order);
    }
  }

  emitOrderAssigned(order: any) {
    this.server.emit('order-assigned', order);
    if (order.driverId) {
      this.server.to(`driver-${order.driverId}`).emit('order-assigned', order);
    }
  }
}
