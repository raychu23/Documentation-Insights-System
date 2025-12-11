import dramatiq
from dramatiq.brokers.redis import RedisBroker
from .git_ingest import clone_or_update_repo, safe_repo_name_from_url
from .fs_ingest import ingest_directory
from ..config import settings, load_ingestion_config

# Configure Redis broker
broker = RedisBroker(url=settings.redis_url)
dramatiq.set_broker(broker)


@dramatiq.actor
def run_fs_ingestion(path: str, repo_name: str | None = None, last_commit: str | None = None):
    print(f"[TASK] FS ingestion queued for: {path}")
    ingest_directory(path, repo_name=repo_name, last_commit=last_commit)


@dramatiq.actor
def run_git_ingestion(repo_url: str, relative_path: str | None = None, branch: str = "main"):
    repo_name = safe_repo_name_from_url(repo_url)
    rel_path = relative_path or f"repos/{repo_name}"
    repo_fs_path = f"/workspace/{rel_path}"

    print(f"[TASK] Git ingestion: url={repo_url}, path={repo_fs_path}, branch={branch}")
    last_commit = clone_or_update_repo(repo_url, repo_fs_path, branch=branch)

    # Strip leading slash for ingestion service (expects relative to /workspace)
    ingest_directory(rel_path, repo_name=repo_name, last_commit=last_commit)


@dramatiq.actor
def auto_ingest_all_repos():
    cfg = load_ingestion_config()
    repos = cfg.get("ingestion", {}).get("repos", [])
    for repo in repos:
        if not repo.get("auto_update", False):
            continue
        url = repo["url"]
        path = repo.get("path", "")
        branch = repo.get("branch", "main")
        # path is absolute (/workspace/...), we want relative
        if path.startswith("/workspace/"):
            rel = path[len("/workspace/"):]
        else:
            rel = path
        print(f"[TASK] Auto-ingest repo {url} -> {rel}")
        run_git_ingestion.send(url, rel, branch)
