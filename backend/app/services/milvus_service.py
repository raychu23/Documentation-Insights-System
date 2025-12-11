from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType

connections.connect(
    alias="default",
    host="rag_milvus",
    port="19530"
)

# Only create schema if not exists
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="file_path", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="chunk_index", dtype=DataType.INT64),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768)
]
schema = CollectionSchema(fields)

try:
    collection = Collection("chunks")
except:
    collection = Collection("chunks", schema)

collection.load()