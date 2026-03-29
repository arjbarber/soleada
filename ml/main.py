import numpy as np
from typing import List
from fastapi import FastAPI
import asyncio
import faiss

import numpy as np
from typing import List

from typing import List
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

# limits heavy ml jobs to 1 
mlSemaphore = asyncio.Semaphore(1)

app = FastAPI()

model = SentenceTransformer("all-MiniLM-L6-v2")

class Post(BaseModel):
    id: str
    text: str
    embedding: List[float] | None = None

class PostPosts(BaseModel):
    userPosts: List[Post]
    otherPosts: List[Post]

@app.post("/embed")
async def embed(req: Post):
    # print("Incoming JSON:", req)
    async with mlSemaphore:
        embedding = model.encode([req.text])
        X = np.array(embedding, dtype=np.float32)
        X = X / np.linalg.norm(X, axis=1, keepdims=True)

    return {
        "embedding": X[0].tolist()
    }

@app.post("/recommend")
async def recommend(req: PostPosts):
    async with mlSemaphore:

        if len(req.otherPosts) == 0:
            return {"topMatches": []}

        compareEmbeddings = np.array(
            [p.embedding for p in req.otherPosts if p.embedding is not None],
            dtype=np.float32
        )

        if len(compareEmbeddings) == 0:
            return {"topMatches": []}

        faiss.normalize_L2(compareEmbeddings)

        dim = compareEmbeddings.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(compareEmbeddings)

        user = np.array([req.userPosts[0].embedding], dtype=np.float32)
        faiss.normalize_L2(user)

        k = min(10, len(compareEmbeddings))
        D, I = index.search(user, k=k)

    topMatches = [
        {
            "postID": req.otherPosts[I[0][i]].id,
            "score": float((D[0][i] + 1) / 2 * 100)
        }
        for i in range(len(I[0]))
    ]

    return {"topMatches": topMatches}