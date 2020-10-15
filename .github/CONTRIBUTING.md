# Contributing

## Submitting Changes

- Issues that are ready to be worked are added and prioritized on [project Kanban board](https://github.com/orgs/carmck/projects/5)
- Create branch off `develop` branch with the related issue number in the name
    - ```<issue-number>-<brief-description>```
    - e.g., `12-contributing-doc`
- Commit code changes (See commit [commit message guidelines](#Commit-Message))
    - Squash unneeded commits
- Open pull request against the `develop` branch
- Gain approvals via code review (the "approved" label will be automatically added once you've gained enough approvals)
- Merge and close pull request

## Commit Message

Commit messages should follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). The body should include issue number closed as a `trailer`.

Example:
```
docs: app deployment

- README updated

Closes: #1
```
