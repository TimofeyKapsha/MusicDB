from fastapi import HTTPException

import database
import schemas
from bson import ObjectId
from typing import Optional

db = database.get_database()


async def search_discs(title: Optional[str] = None, band: Optional[str] = None, year: Optional[int] = None):
    # Построение запроса с учётом переданных опциональных полей
    query = {}

    # Проверяем, какие поля переданы, и добавляем их в запрос
    if title:
        query["title"] = {"$regex": title, "$options": "i"}  # Поддержка поиска по подстроке
    if band:
        query["band"] = {"$regex": band, "$options": "i"}
    if year:
        query["year"] = year

    # Выполняем запрос в MongoDB
    discs = []
    cursor = db["discs"].find(query)  # Фильтрация по запросу
    async for disc in cursor:
        # Преобразуем из MongoDB-данных в нашу схему
        disc["id"] = str(disc["_id"])
        discs.append(schemas.MusicDisc(**disc))
    return discs


async def update_disc(disc_id: str, disc: schemas.MusicDiscCreate):
    result = await db["discs"].update_one({"_id": ObjectId(disc_id)}, {"$set": disc.dict()})
    if result.modified_count == 0:
        return None

    # Получаем обновлённый объект
    updated_disc = await db["discs"].find_one({"_id": ObjectId(disc_id)})

    # Преобразуем _id в id
    updated_disc["id"] = str(updated_disc["_id"])
    updated_disc.pop("_id", None)

    # Возвращаем объект, совместимый с схемой Pydantic
    return schemas.MusicDisc(**updated_disc)



# --- CRUD для групп (Groups) ---

async def search_groups(name: Optional[str] = None, country: Optional[str] = None, genre: Optional[str] = None):
    # Построение запроса с учётом переданных опциональных полей
    query = {}

    # Проверяем, какие поля переданы, и добавляем их в запрос
    if name:
        query["name"] = {"$regex": name, "$options": "i"}  # Поддержка поиска по подстроке
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if genre:
        query["genre"] = {"$regex": genre, "$options": "i"}

    # Выполняем запрос в MongoDB
    groups = []
    cursor = db["groups"].find(query)  # Фильтрация по запросу
    async for group in cursor:
        # Преобразуем из MongoDB-данных в нашу схему
        group["id"] = str(group["_id"])
        groups.append(schemas.MusicGroup(**group))
    return groups


async def update_group(group_id: str, group: schemas.MusicGroupCreate):
    result = await db["groups"].update_one({"_id": ObjectId(group_id)}, {"$set": group.dict()})
    if result.modified_count == 0:
        return None

    # Получаем обновлённый объект из базы данных
    updated_group = await db["groups"].find_one({"_id": ObjectId(group_id)})

    # Преобразуем _id в id
    updated_group["id"] = str(updated_group["_id"])
    updated_group.pop("_id", None)  # Удаляем _id

    # Возвращаем объект, совместимый с схемой Pydantic
    return schemas.MusicGroup(**updated_group)



async def delete_group(group_id: str):
    try:
        # Преобразуем строковый ID в ObjectId
        result = await db["groups"].delete_one({"_id": ObjectId(group_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Group not found.")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid group ID format.")


async def get_discs():
    discs = []
    cursor = db["discs"].find()
    async for disc in cursor:
        # Преобразуем MongoDB _id в строковый id, добавляя поле id
        disc["id"] = str(disc["_id"])
        discs.append(schemas.MusicDisc(**disc))
    return discs


async def add_disc(disc: schemas.MusicDiscCreate):
    disc_dict = disc.dict()
    result = await db["discs"].insert_one(disc_dict)
    return schemas.MusicDisc(**disc_dict, id=str(result.inserted_id))


async def delete_disc(disc_id: str):
    try:
        # Преобразуем строковый ID в ObjectId
        result = await db["discs"].delete_one({"_id": ObjectId(disc_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Disc not found.")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid ID format.")


async def get_groups():
    groups = []
    cursor = db["groups"].find()
    async for group in cursor:
        group["id"] = str(group["_id"])
        del group["_id"]
        groups.append(schemas.MusicGroup(**group))
    return groups


async def add_group(group: schemas.MusicGroupCreate):
    group_dict = group.dict()
    result = await db["groups"].insert_one(group_dict)
    return schemas.MusicGroup(**group_dict, id=str(result.inserted_id))


async def get_group_by_id(group_id: str):
    try:
        # Получаем данные о группе из базы данных
        group = await db["groups"].find_one({"_id": ObjectId(group_id)})
        if not group:
            return None

        # Преобразуем `_id` в поле `id`
        group["id"] = str(group["_id"])
        del group["_id"]  # Удаляем оригинальное поле `_id`

        # Возвращаем преобразованный объект
        return schemas.MusicGroup(**group)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid group ID format: {str(e)}")
