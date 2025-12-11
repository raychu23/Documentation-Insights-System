import os
import subprocess
from typing import Optional


def safe_repo_name_from_url(repo_url: str) -> str:
    base = repo_url.rstrip("/").split("/")[-1]
    if base.endswith(".git"):
        base = base[:-4]
    return base.replace(" ", "-").lower()


def get_last_commit_hash(repo_path: str) -> Optional[str]:
    try:
        result = subprocess.run(
            ["git", "-C", repo_path, "rev-parse", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except Exception as e:
        print(f"[GIT] Could not get last commit for {repo_path}: {e}")
        return None


def clone_or_update_repo(repo_url: str, repo_path: str, branch: str = "main") -> str:
    """Clone the repo if missing, otherwise pull latest changes. Returns last commit hash."""
    os.makedirs(os.path.dirname(repo_path), exist_ok=True)

    if not os.path.exists(repo_path):
        print(f"[GIT] Cloning {repo_url} into {repo_path} ...")
        subprocess.run(
            ["git", "clone", "--branch", branch, "--single-branch", repo_url, repo_path],
            check=False,
        )
    else:
        print(f"[GIT] Pulling latest changes in {repo_path} ...")
        subprocess.run(
            ["git", "-C", repo_path, "pull", "origin", branch],
            check=False,
        )

    commit = get_last_commit_hash(repo_path)
    print(f"[GIT] Repo {repo_path} at commit {commit}")
    return commit or ""
