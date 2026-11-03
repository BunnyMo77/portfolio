# Portfolio editing workflow

The user designated this workspace/chat for Beini Mo's portfolio.

- Site: https://beini-mo-selected-design.marco-trevisan-mota.chatgpt.site/
- Existing Sites project ID: appgprj_6ae9a7529904819184064300f59ae0ca
- GitHub: BunnyMo77/portfolio, branch main. Use the connected BunnyMo77 (Beini) account.
- Local Sites project: beini-portfolio; static output: beini-portfolio/dist.
- GitHub Pages export: beini-github-pages; its contents map to the GitHub repository root.

For each requested website edit in this chat, implement and validate the change, synchronize the same HTML/assets into both local copies, commit the affected website files to GitHub main, and publish an updated version of the existing Site using the Sites skill. The user has authorized these updates without another conversational permission request unless they explicitly request a draft/local-only change.
Read current remote files before replacement and preserve unrelated changes. Use normal commits; never force-push or erase history. Keep the existing Site audience. Do not upload credentials, temporary archives, or unrelated workspace files.
Follow the Sites source-helper workflow for its separate managed source repository; GitHub and Sites require separate updates. Never claim both succeeded without verifying both results. Report any partial failure.
This is an agent workflow applied when processing edits, not a background file watcher or continuous synchronization service. Deployment may take time after a push. Discussion alone does not change the website.
