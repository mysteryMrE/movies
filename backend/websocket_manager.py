from fastapi import WebSocket
import json
from datetime import datetime
from utils.logger import setup_colored_logging

logger = setup_colored_logging()

# TODO handle reconnections properly


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
            websocket_to_close = self.active_connections.get(user_id)
            del self.active_connections[user_id]
            logger.info(
                f"User {user_id} disconnected. Total connections: {len(self.active_connections)}"
            )
            if websocket_to_close:
                try:
                    await websocket_to_close.close()
                    logger.info(f"WebSocket for user {user_id} explicitly closed.")
                except RuntimeError as e:
                    logger.warning(
                        f"Attempted to close already-closed WebSocket for user {user_id}: {e}"
                    )
                except Exception as e:
                    logger.error(f"Error closing WebSocket for user {user_id}: {e}")

        logger.info(
            f"User {user_id} disconnected. Total connections: {len(self.active_connections)}"
        )

    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
                logger.info(f"Message sent to {user_id}: {message}")
                return True
            except Exception as e:
                logger.error(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)
                return False
        return False

    async def broadcast_to_all_other(self, message: dict, excluded_user_id: str):
        disconnected_users = []
        connections_copy = list(self.active_connections.items())
        active_user_count = len(connections_copy)
        for user_id, connection in connections_copy:
            if user_id != excluded_user_id:
                try:
                    await connection.send_text(json.dumps(message))
                    logger.info(f"Notification sent to user {user_id}")
                except Exception as e:
                    logger.error(f"Error sending notification to {user_id}: {e}")
                    disconnected_users.append(user_id)

        for user_id in disconnected_users:
            await self.disconnect(user_id)

        return active_user_count - len(disconnected_users) - 1

    async def handle_favorite_action(
        self, user_id: str, movie_data: dict, user_name: str
    ):
        try:
            notification = {
                "type": "new_favorite",
                "message": f"🎬 {user_name} just favorited '{movie_data['title']}'",
            }
            await self.send_personal_message(
                {
                    "type": "favorite_confirmed",
                    "message": f"🎬 You just favorited {movie_data['title']}",
                    "movie": movie_data,
                },
                user_id,
            )

            notifications_sent = await self.broadcast_to_all_other(
                notification, user_id
            )

            logger.info(f"Favorite notification sent to {notifications_sent} users")
            return notifications_sent

        except Exception as e:
            logger.error(f"Error handling favorite action for {user_id}: {e}")
            return 0


# Global connection manager instance
manager = ConnectionManager()
