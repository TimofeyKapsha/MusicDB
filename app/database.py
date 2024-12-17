from motor.motor_asyncio import AsyncIOMotorClient

client: AsyncIOMotorClient = None
database = None


def get_database():
    global client, database
    if client is None:
        client = AsyncIOMotorClient("mongodb://mongo:27017")
        database = client["musicdb"]
    return database
