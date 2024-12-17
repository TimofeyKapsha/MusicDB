from fastapi import FastAPI, HTTPException
from typing import List, Optional
import crud
import schemas

app = FastAPI()


# --- Маршруты для Дисков (Discs) ---

@app.get("/discs", response_model=List[schemas.MusicDisc])
async def get_all_discs():
    return await crud.get_discs()


@app.post("/discs", response_model=schemas.MusicDisc)
async def add_disc(disc: schemas.MusicDiscCreate):
    return await crud.add_disc(disc)


@app.delete("/discs/{disc_id}")
async def delete_disc_by_id(disc_id: str):
    await crud.delete_disc(disc_id)
    return {"message": f"Disc with ID {disc_id} was deleted successfully."}


@app.get("/discs/search", response_model=List[schemas.MusicDisc])
async def search_discs(title: Optional[str] = None, band: Optional[str] = None, year: Optional[int] = None):
    results = await crud.search_discs(title=title, band=band, year=year)
    if not results:
        raise HTTPException(status_code=404, detail="No discs found with the given search criteria.")
    return results


@app.put("/discs/{disc_id}", response_model=schemas.MusicDisc)
async def update_disc(disc_id: str, disc: schemas.MusicDiscCreate):
    updated_disc = await crud.update_disc(disc_id=disc_id, disc=disc)
    if not updated_disc:
        raise HTTPException(status_code=404, detail="Disc not found.")
    return updated_disc


# --- Маршруты для Групп (Groups) ---

@app.get("/groups", response_model=List[schemas.MusicGroup])
async def get_all_groups():
    return await crud.get_groups()


@app.post("/groups", response_model=schemas.MusicGroup)
async def add_group(group: schemas.MusicGroupCreate):
    return await crud.add_group(group)


@app.delete("/groups/{group_id}")
async def delete_group_by_id(group_id: str):
    await crud.delete_group(group_id)
    return {"message": f"Group with ID {group_id} was deleted successfully."}


@app.get("/groups/search", response_model=List[schemas.MusicGroup])
async def search_groups(name: Optional[str] = None, country: Optional[str] = None, genre: Optional[str] = None):
    results = await crud.search_groups(name=name, country=country, genre=genre)
    if not results:
        raise HTTPException(status_code=404, detail="No groups found with the given search criteria.")
    return results


@app.put("/groups/{group_id}", response_model=schemas.MusicGroup)
async def update_group(group_id: str, group: schemas.MusicGroupCreate):
    updated_group = await crud.update_group(group_id=group_id, group=group)
    if not updated_group:
        raise HTTPException(status_code=404, detail="Group not found.")
    return updated_group


@app.get("/groups/{group_id}", response_model=schemas.MusicGroup)
async def get_group_by_id(group_id: str):
    group = await crud.get_group_by_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")
    return group
