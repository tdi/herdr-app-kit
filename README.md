# herdr-app-kit

A personal setup for the [Herdr app](https://herdr.dev): a layout and seven mods for running coding agents across a few machines and several organisations. It adds Linear and pull requests next to your terminals, colored agent tiles, spaces grouped by company, CI with a pipeline strip, and reminders about dev stacks you forgot to stop.

Everything here is plain Herdr app files: a layout JSON and gpui-kit mods. Read any of them before you install; they're short and commented at the top.

## What's inside

| Path | What you get |
|---|---|
| `layouts/my-main.json` | A clone of Herdr's `main` layout. In the left sidebar, Spaces (`my-spaces`) is on top and agent tiles are below. Above the terminals is a tab bar (`my-tabs`) with Files, Changes, Linear, PRs and CI panel buttons. At the bottom is a status bar (`my-status`). |
| `mods/my-tabs` | The tab bar. Its panel buttons open and close the right side panel, which is remembered per space. Keys: ⌘⌥L for Linear, ⌘⌥P for PRs, ⌘⌥C for CI. |
| `mods/agent-tiles` | Agents as a grid of colored squares instead of a list, labeled with their space's initials. Blocked is red, done is green, working is yellow with a pulsing dot, idle is grey. Blocked tiles come first, the rest by most recent activity. Hover shows the name, click goes there, and agents on another machine show that machine's initial. ⌘⌥A hides and shows the block. |
| `mods/my-spaces` | Herdr's Spaces list with additions, described below. |
| `mods/linear` | Your Linear team's active issues, each linked to the space that works on its branch. More in the Linear section below. |
| `mods/prs` | Open GitHub PRs (`gh`) or GitLab MRs (`glab`) of the focused repo. Filters: All, Mine, To review. Actions: **Worktree**, **Worktree + Claude** (asks Claude to review it) and **Open**. Same-repo PRs check out their real branch; fork PRs go to `pr-<N>`. |
| `mods/ci` | Checks of the focused branch on GitHub or GitLab. Failed checks get Log, Re-run and Fix with Claude. Above the checks is a pipeline strip, described below. |
| `mods/my-status` | Herdr's status bar plus a Docker (Colima) indicator for the machine of the space you're in. |
| `themes/catppuccin-macchiato.json` | Catppuccin Macchiato, matching the Ghostty theme of the same name. |
| `examples/` | `keys.json`, `companies.json`, `worktree-setup.toml` and `linear-config.json` to start from. |

### my-spaces in more detail

- **Company groups.** Spaces are grouped by company, matched from the repo's origin URL against `companies.json`. Herdr's real space order follows the groups, so ⌃1–9 match what you see.
- **Merged worktrees.** A worktree whose PR or MR is merged shows **merged · remove**. Clicking it opens Herdr's remove-worktree dialog.
- **Dev stacks.** Running docker compose projects (matched by working dir) and Tilt instances show as a chip on their space's row. Click the chip to stop them.
- **Forgotten stacks.** Stacks whose folder has no space are listed under **Running without a space**.
- **Worktree setup.** New worktrees get the steps from `worktree-setup.toml` (copy `.env`, `mise trust`, install deps), whichever way they were made.

### Linear in more detail

- **Starting work.** Start an issue as a git worktree, plus Claude if you want, in a new space.
- **Heavy work on one machine.** With `agentMachine` set, worktrees and agents are created on that machine even when you click from another computer connected to it. **Here (light)** starts on the computer you're at.
- **Choosing a repo.** An expanded issue offers the repos of your `repoOrgs` and guesses one from a `repo:` title prefix.
- **Search.** The filter searches the loaded list first, then Linear itself.

### The CI pipeline strip

The strip reads **PR › CI › Review › Merged**. On a branch named after a ticket of your Linear team (`eng-123-…`), it starts with **Spec** and **Review loop** and ends with the Linear state.
- **Spec** looks for `docs/specs/<TICKET>*.md` and flags open `[QUESTION]`s.
- **Review loop** reads `docs/reviews/<TICKET>-ledger.md` and shows its CONVERGED, CHURN, CAP or ERROR state.

## Requirements

- The Herdr app, recent enough to have `mod.clone` and machines.
- `git`; `gh` (authenticated) for GitHub; `glab` (authenticated) for GitLab.
- `jq` or `python3`, used to slim Tilt's API output; `docker` and `colima` for the Docker indicator.
- For Linear: a [personal API key](https://linear.app/settings/account/security).
- Optional: [FiraCode Nerd Font](https://www.nerdfonts.com/) (`brew install --cask font-fira-code-nerd-font`), which the theme was paired with.

## Install

```sh
git clone https://github.com/tdi/herdr-app-kit
cd herdr-app-kit
./install.sh          # never overwrites; --force to replace existing files
herdr-app do layout.switch --name my-main
```

Then:

1. **Keys.** Merge the `"layout:my-main"` section of `examples/keys.json` into `~/.config/herdr-app/keys.json`.
2. **Theme and font.** Optional. In `~/.config/herdr-app/settings.json`, set `"theme": "catppuccin-macchiato"` and `"font": "FiraCode Nerd Font Mono"`.
3. **Linear.**
   - Copy `examples/linear-config.json` to `~/.config/herdr-app/linear.json` and put your key in it.
   - Run `chmod 600 ~/.config/herdr-app/linear.json`.
   - **Never commit this file.**
4. **Companies.** Edit `~/.config/herdr-app/companies.json`. Each entry is a `name`, a `match` regex for the origin URL and a theme `color` (`ansi1`–`ansi6`). With no file, there are no groups.
5. **Worktree setup.** Edit `~/.config/herdr-app/worktree-setup.toml`.

Check each mod after any change: `herdr-app check ~/.config/herdr-app/mods/<name>`.

## Configuration reference

**`linear.json`**

| Key | Meaning |
|---|---|
| `linearApiKey` | Your Linear API key. Or export `LINEAR_API_KEY`. |
| `teamKey` | Team to list, e.g. `ENG`. Also the ticket prefix the CI strip looks for in branch names. |
| `issueLimit`, `includeTriage`, `assignedToMe` | What to list. |
| `base` | Branch new worktrees start from: `default` (origin's HEAD), `head`, or a branch name. |
| `worktreeRoot` | Where checkouts go: `<root>/<repo>/<branch>`. |
| `agentMachine` | Name of a Herdr machine (`hc machine ls`) that heavy work goes to. |
| `repoOrgs` | GitHub or GitLab orgs whose `~/Projects/*` checkouts are offered per issue. |
| `repos` | Optional map from team key to repo path, e.g. `{ "ENG": "~/Projects/app" }`. |

**`worktree-setup.toml`**

- Steps under `[default]`, or under a `[[project]]` with `path = "<main repo>"`, run in each new worktree.
- They run with `HERDR_MAIN_REPO`, `HERDR_WORKTREE` and `HERDR_BRANCH` set.
- A worktree counts as new for 10 minutes after `git worktree add`. After success, a marker in its git dir stops the steps from running again.

**Constants at the top of mods**

- `WORKTREE_ROOT` in `mods/prs/main.js`.
- `TILT_SLOTS` and `TILT_PORTS` in `mods/my-spaces/main.js`. These follow one convention: Tilt instances on ports 10350–10359, with a `<slot> <path>` registry file. Tilt instances not in that file still run but aren't placed on a space.

## Watch out

- **Add `mod.json` before `main.js`.** When you add a new mod folder by hand, write `mod.json` first. Herdr docks a mod folder it sees without `mod.json` as a 320px panel on the right. `install.sh` handles this order.
- **Herdr updates.** `my-spaces`, `my-tabs` and `my-status` are clones of Herdr's own `spaces`, `tabs` and `workspace-status` mods. They won't pick up Herdr's later changes to those mods, so re-clone and re-apply if something drifts.
- **Linear key.** The Linear config holds a secret. If you sync this setup with chezmoi or similar, add the mod and layout files, not the whole folder.
- **Stop buttons arm first.** Click once to arm, click again to run. Docker volumes are kept.

## License

MIT
