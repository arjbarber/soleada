import datetime
import math
import hdbscan
import numpy as np
from typing import List
from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
import faiss
import time

import numpy as np
import math
from typing import List
from scipy.spatial.distance import pdist, squareform
import hdbscan
import time

from typing import List
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

# limits heavy ml jobs to 1 
mlSemaphore = asyncio.Semaphore(1)

app = FastAPI(lifespan=lifespan)

# angle similarity between two points
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

model = SentenceTransformer("all-MiniLM-L6-v2")

class Post(BaseModel):
    text: str

class Posts(BaseModel):
    posts: List[Post]
    takenLabels: List[int]
    badLabels: List[int]

class PostPosts(BaseModel):
    userPosts: List[Post]
    otherPosts: List[int]

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

@app.post("/cluster")
async def cluster(req: Posts):
    weighStart = time.time()
    async with mlSemaphore:
        semaStart = time.time()
        # scans embeddings
        X = np.array([p.embedding for p in req.posts], dtype=np.float32)
        # normalizes REMEMBER TO REMOVE
        # X = X / np.linalg.norm(X, axis=1, keepdims=True)
        if(len(X) < 2):
            labels = [-1] * len(X)
        else:
            clusterer = hdbscan.HDBSCAN(
                min_cluster_size = 2,
                metric = 'euclidean'
                )
            labels = clusterer.fit_predict(X).tolist()
        semaEnd = time.time()
        print(f"{req.minCluster} scan took {semaEnd - semaStart:.3f} seconds!")
    # print("labels")
    # print(labels)
    # print("taken")
    # print(req.takenLabels)
    # print("bad")
    # print(req.badLabels)

    # actively assumes that each badLabel will be in takenLabel
    # not a problem as it they are both edited in the same single sequence, safegaurded
    # removes the inactive labels

    takenLabels = [label for label in req.takenLabels if label not in req.badLabels]
    
    # print("newTaken")
    # print(req.takenLabels)
    # remaps labels to global unique labels
    taken, labelMap = getGlobalLabels(takenLabels, labels)
    # print("globalTaken")
    # print(taken)
    # print("labelMap")
    # print(labelMap)

    # print("PRE PRE PRE PRE")
    # for post in req.posts:
    #     print(msg.label)
    
    # aggregates clusters and applies global labels
    globalLabels = applyGlobalLabels(labels, labelMap, req.messages, req.scope)
    # print("globalLabels")
    # print(globalLabels)


    # print("POST POST POST POST ")
    # for post in req.posts:
    #     print(post.label)


    # returns proper json
    weighEnd = time.time()
    print(f" production took {weighEnd - weighStart:.3f} seconds!")

    return {
        "globalLabels": globalLabels,
        "takenLabels": list(taken)
    }

def getGlobalLabels(takenLabels, newLabels):
    # remaps labels to global unique labels
    taken = set(takenLabels) if takenLabels else set()
    labelMap = {-1: -1}
    nextLabel = 0
    for label in set(newLabels):
        if label == -1:
            continue
        while nextLabel in taken:
            nextLabel += 1
        labelMap[label] = nextLabel
        taken.add(nextLabel)
    return taken, labelMap

def applyGlobalLabels(labels, labelMap, posts : List[Post]):

    # aggregates clusters and saves global labels
    globalLabels = []
    for i, post in enumerate(posts):
        currentLabel = labels[i]
        globalLabels.append(labelMap[currentLabel])  
        post.label = labelMap[currentLabel]

    return globalLabels

@app.post("/profile")
async def profile(req: PostPosts):
    async with mlSemaphore:
        # WARNING WARNING WARNING, ALL THIS RELIES ON UNMUTATED INDEX
        # DO NOT CHANGE INDEX IN PROCESS OR INIT DICTS INSTEAD OF ARRAYS
        # normalizes the centroids of the clusters set for comparison
        compareCentroids = np.array([c.centroid for c in req.otherPosts], dtype=np.float32)
        faiss.normalize_L2(compareCentroids)

        # maps strings ids to ints
        # this method is likely inefficient am tired will fix later 
        # it works tho

        # use if mutating index, it returns vectors as given so no need right now
        # compareIDs = [c.id for c in req.compare]
        # str2int = {s: i for i, s in enumerate(compareIDs)}
        # int2str = {i: s for s, i in str2int.items()}
        # ids = np.array([str2int[s] for s in compareIDs], dtype=np.int64)
        # inits index and adds normalized centroids for later comparison
        # index = faiss.IndexFlatIP(DIMENSIONS)
        # index = faiss.IndexIDMap(index)
        # index.add_with_ids(compareCentroids, ids)

        index = faiss.IndexFlatIP(384)
        index.add(compareCentroids)

        # compares then aggregates each centroid comparison from the user
        user = np.array([c.centroid for c in req.userPosts], dtype='float32')
        faiss.normalize_L2(user)
        D, I = index.search(user, k=2)
    
    userWeights = np.array([c.weight for c in req.user], dtype='float32')
    
    compareWeightsScoped = np.array([req.compare[i].weight for i in I.ravel()], dtype='float32')
    compareWeightsMatrix = compareWeightsScoped.reshape(D.shape)

    DWeighted = D * userWeights[:, None] * compareWeightsMatrix

    idMap = {i: c.ownerID for i,c in enumerate(req.compare)}
    ids = np.vectorize(idMap.get)(I)

    uniqueIds = np.unique(ids)
    uidMap = {uid: i for i, uid in enumerate(uniqueIds)}
    uids = np.vectorize(uidMap.get)(ids)

    scores = np.zeros(uids.max()+1, dtype=np.float32)
    np.add.at(scores, uids.ravel(), DWeighted.ravel())

    # get indices of top 10 scores (descending)
    topK = 10
    topIndices = np.argsort(scores)[::-1][:topK]
    
    topMatches = [
        {
            "postID": uniqueIds[i],
            "score": float(scores[i])  # convert from numpy type
        }
        for i in topIndices
    ]  

    return {
        "topMatches" : topMatches
    }

# for health checks and making sure the reducer is properly loaded on server starts

@app.get("/health")
async def health():
    if (reducer3 is None or reducer5 is None):
        print("Failed Health Check!")
        return {"status": "loading"}, 503
    print("ML is locked and loaded!")
    print("Server is running on port 8000")
    return {"status": "ok"}, 200