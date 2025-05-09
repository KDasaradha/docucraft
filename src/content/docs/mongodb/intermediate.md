---
title: MongoDB - Intermediate
---

# MongoDB - Intermediate Concepts

Key topics for intermediate MongoDB include:

- Aggregation Framework:
    - Pipeline stages (`$match`, `$group`, `$project`, `$sort`, `$limit`, `$skip`, `$unwind`)
    - Accumulators (`$sum`, `$avg`, `$min`, `$max`, `$push`, `$addToSet`)
- Indexing in Depth:
    - Single field, compound indexes
    - Multikey indexes (for arrays)
    - Text indexes for text search
    - Geospatial indexes
    - Index properties (unique, sparse, TTL)
    - `explain()` to analyze query performance
- Data Modeling:
    - Embedding vs. Referencing documents
    - Schema design patterns (e.g., polymorphic, attribute, bucket)
- Update Operators in Depth (`$push`, `$pull`, `$addToSet`, `$pop`, `$rename`, `$currentDate`)
- Read and Write Concerns
- Transactions (multi-document ACID transactions)
- GridFS for storing large files
- User Authentication and Authorization (Roles, Privileges)
