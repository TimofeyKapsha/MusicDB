from pydantic import BaseModel

class MusicDiscCreate(BaseModel):
    title: str
    band: str
    year: int

class MusicDisc(MusicDiscCreate):
    id: str

class MusicGroupCreate(BaseModel):
    name: str
    country: str
    genre: str

class MusicGroup(MusicGroupCreate):
    id: str