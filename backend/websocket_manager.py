from fastapi import WebSocket
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# TODO take care of concurenccy issues with the active connecitons
# TODO handle reconnections properly
# TODO disconnecting is a bit funky, sny vs asnyc what is going on, double disconnecting happens also


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(
            f"User {user_id} connected. Total connections: {len(self.active_connections)}"
        )

        await self.send_personal_message(
            {
                "type": "connection_established",
                "message": "Connected to movie notifications!",
            },
            user_id,
        )

    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            print("hello")
            websocket_to_close = self.active_connections.get(user_id)
            del self.active_connections[user_id]
            logger.info(
                f"User {user_id} disconnected. Total connections: {len(self.active_connections)}"
            )
            if websocket_to_close:
                try:
                    await websocket_to_close.close()
                    print("hihi")
                    logger.info(f"WebSocket for user {user_id} explicitly closed.")
                except RuntimeError as e:
                    logger.warning(
                        f"Attempted to close already-closed WebSocket for user {user_id}: {e}"
                    )
                except Exception as e:
                    # Catch any other unexpected errors during close
                    logger.error(f"Error closing WebSocket for user {user_id}: {e}")

        logger.info(
            f"User {user_id} disconnected. Total connections: {len(self.active_connections)}"
        )

    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
                return True
            except Exception as e:
                # logger.error(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)
                return False
        return False

    async def broadcast_to_all_other(self, message: dict, excluded_user_id: str):
        disconnected_users = []
        connections_copy = list(self.active_connections.items())
        for user_id, connection in connections_copy:
            if user_id != excluded_user_id:
                try:
                    await connection.send_text(json.dumps(message))
                    logger.info(f"Notification sent to user {user_id}")
                except Exception as e:
                    # logger.error(f"Error sending notification to {user_id}: {e}")
                    disconnected_users.append(user_id)

        # Clean up broken connections
        for user_id in disconnected_users:
            await self.disconnect(user_id)

        return len(self.active_connections) - len(disconnected_users) - 1

    async def handle_favorite_action(
        self, user_id: str, movie_data: dict, user_name: str
    ):
        try:
            # Create notification message
            notification = {
                "type": "new_favorite",
                "message": f"🎬 {user_name} just favorited '{movie_data['title']}'!",
            }

            # Send confirmation to the user who favorited
            await self.send_personal_message(
                {
                    "type": "favorite_confirmed",
                    "message": f"You favorited {user_name} '{movie_data['title']}'!",
                    "movie": movie_data,
                },
                user_id,
            )

            # Broadcast to all other users
            notifications_sent = await self.broadcast_to_all_other(
                notification, user_id
            )

            logger.info(f"Favorite notification sent to {notifications_sent} users")
            return notifications_sent

        except Exception as e:
            # logger.error(f"Error handling favorite action: {e}")
            return 0


# Global connection manager instance
manager = ConnectionManager()
