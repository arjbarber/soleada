import hdbscan
import numpy as np
from typing import List
from fastapi import FastAPI
import asyncio
import faiss
import time

import numpy as np
from typing import List
import hdbscan
import time

from typing import List
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

# limits heavy ml jobs to 1 
mlSemaphore = asyncio.Semaphore(1)

app = FastAPI()

# angle similarity between two points
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

model = SentenceTransformer("all-MiniLM-L6-v2")

class Post(BaseModel):
    id: str
    text: str
    embedding: List[float] | None = None

# class Posts(BaseModel):
#     posts: List[Post]
#     takenLabels: List[int]
#     badLabels: List[int]

class PostPosts(BaseModel):
    userPosts: List[Post]
    otherPosts: List[Post]

@app.post("/embed")
async def embed(req: Post):
    # print("Incoming JSON:", req)
    async with mlSemaphore:
        # embeds texts
        embedding = model.encode(req.text)
        X = np.array(embedding, dtype=np.float32)

        # normalize, saves headaches everywhere else
        X = X / np.linalg.norm(X, axis=1, keepdims=True)

    # returning proper json
    return {
        "embedding" : embedding.tolist(),
    }

# @app.post("/cluster")
# async def cluster(req: Posts):
#     weighStart = time.time()
#     async with mlSemaphore:
#         semaStart = time.time()
#         # scans embeddings
#         X = np.array([p.embedding for p in req.posts], dtype=np.float32)
#         # normalizes REMEMBER TO REMOVE
#         # X = X / np.linalg.norm(X, axis=1, keepdims=True)
#         if(len(X) < 2):
#             labels = [-1] * len(X)
#         else:
#             clusterer = hdbscan.HDBSCAN(
#                 min_cluster_size = 2,
#                 metric = 'euclidean'
#                 )
#             labels = clusterer.fit_predict(X).tolist()
#         semaEnd = time.time()
#         print(f"{req.minCluster} scan took {semaEnd - semaStart:.3f} seconds!")
#     # print("labels")
#     # print(labels)
#     # print("taken")
#     # print(req.takenLabels)
#     # print("bad")
#     # print(req.badLabels)

#     # actively assumes that each badLabel will be in takenLabel
#     # not a problem as it they are both edited in the same single sequence, safegaurded
#     # removes the inactive labels

#     takenLabels = [label for label in req.takenLabels if label not in req.badLabels]
    
#     # print("newTaken")
#     # print(req.takenLabels)
#     # remaps labels to global unique labels
#     taken, labelMap = getGlobalLabels(takenLabels, labels)
#     # print("globalTaken")
#     # print(taken)
#     # print("labelMap")
#     # print(labelMap)

#     # print("PRE PRE PRE PRE")
#     # for post in req.posts:
#     #     print(msg.label)
    
#     # aggregates clusters and applies global labels
#     globalLabels = applyGlobalLabels(labels, labelMap, req.messages, req.scope)
#     # print("globalLabels")
#     # print(globalLabels)


#     # print("POST POST POST POST ")
#     # for post in req.posts:
#     #     print(post.label)


#     # returns proper json
#     weighEnd = time.time()
#     print(f" production took {weighEnd - weighStart:.3f} seconds!")

#     return {
#         "globalLabels": globalLabels,
#         "takenLabels": list(taken)
#     }

# def getGlobalLabels(takenLabels, newLabels):
#     # remaps labels to global unique labels
#     taken = set(takenLabels) if takenLabels else set()
#     labelMap = {-1: -1}
#     nextLabel = 0
#     for label in set(newLabels):
#         if label == -1:
#             continue
#         while nextLabel in taken:
#             nextLabel += 1
#         labelMap[label] = nextLabel
#         taken.add(nextLabel)
#     return taken, labelMap

# def applyGlobalLabels(labels, labelMap, posts : List[Post]):

#     # aggregates clusters and saves global labels
#     globalLabels = []
#     for i, post in enumerate(posts):
#         currentLabel = labels[i]
#         globalLabels.append(labelMap[currentLabel])  
#         post.label = labelMap[currentLabel]

#     return globalLabels

@app.post("/recommend")
async def recommend(req: PostPosts):
    # async with mlSemaphore:
    #     # WARNING WARNING WARNING, ALL THIS RELIES ON UNMUTATED INDEX
    #     # DO NOT CHANGE INDEX IN PROCESS OR INIT DICTS INSTEAD OF ARRAYS
    #     # normalizes the centroids of the clusters set for comparison
    #     compareEmbeddings = np.array([p.embedding for p in req.otherPosts], dtype=np.float32)
    #     faiss.normalize_L2(compareEmbeddings)

    #     index = faiss.IndexFlatIP(384)
    #     index.add(compareEmbeddings)

    #     # compares then aggregates each embedding comparison from the user
    #     user = np.array([p.embedding for p in req.userPosts], dtype='float32')
    #     faiss.normalize_L2(user)
    #     D, I = index.search(user, k=2)
    
    # userWeights = np.array([c.weight for c in req.user], dtype='float32')
    
    # compareWeightsScoped = np.array([req.compare[i].weight for i in I.ravel()], dtype='float32')
    # compareWeightsMatrix = compareWeightsScoped.reshape(D.shape)

    # DWeighted = D * userWeights[:, None] * compareWeightsMatrix

    # idMap = {i: c.ownerID for i,c in enumerate(req.compare)}
    # ids = np.vectorize(idMap.get)(I)

    # uniqueIds = np.unique(ids)
    # uidMap = {uid: i for i, uid in enumerate(uniqueIds)}
    # uids = np.vectorize(uidMap.get)(ids)

    # scores = np.zeros(uids.max()+1, dtype=np.float32)
    # np.add.at(scores, uids.ravel(), DWeighted.ravel())

    # # get indices of top 10 scores (descending)
    # topK = 10
    # topIndices = np.argsort(scores)[::-1][:topK]
    
    # topMatches = [
    #     {
    #         "postID": uniqueIds[i],
    #         "score": float(scores[i])  # convert from numpy type
    #     }
    #     for i in topIndices
    # ]  

    # return {
    #     "topMatches" : topMatches
    # }

    async with mlSemaphore:
        # Build comparison embeddings
        compareEmbeddings = np.array([p.embedding for p in req.otherPosts], dtype=np.float32)
        faiss.normalize_L2(compareEmbeddings)

        index = faiss.IndexFlatIP(384)
        index.add(compareEmbeddings)

        # User embeddings
        user = np.array([p.embedding for p in req.userPosts], dtype='float32')
        faiss.normalize_L2(user)

        # Search
        D, I = index.search(user, k=2)

    # --- NO WEIGHTS ---

    # Map indices → post IDs
    idMap = {i: p.id for i, p in enumerate(req.otherPosts)}
    ids = np.vectorize(idMap.get)(I)

    # Unique users
    uniqueIds = np.unique(ids)
    uidMap = {uid: i for i, uid in enumerate(uniqueIds)}
    uids = np.vectorize(uidMap.get)(ids)

    # Aggregate raw similarity scores
    scores = np.zeros(uids.max() + 1, dtype=np.float32)
    np.add.at(scores, uids.ravel(), D.ravel())

    # Top K
    topK = 10
    topIndices = np.argsort(scores)[::-1][:topK]

    topMatches = [
        {
            "postID": uniqueIds[i],
            "score": float(scores[i])
        }
        for i in topIndices
    ]

    return {
        "topMatches": topMatches
    }

# for health checks and making sure the reducer is properly loaded on server starts

@app.get("/health")
async def health():
    print("ML is locked and loaded!")
    print("Server is running on port 8000")
    return {"status": "ok"}, 200