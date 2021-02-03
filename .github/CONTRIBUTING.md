# Contributing

## Developer Setup

- Install `git`
- `git clone https://github.com/carmck/battle-maps.git`
- Install [nodejs](https://nodejs.org/en/)

## Submitting Changes

- Issues that are ready to be worked are added and prioritized on [project Kanban board](https://github.com/orgs/carmck/projects/5)
- Create branch off `develop` branch with the related issue number in the name
    - ```<issue-number>-<brief-description>```
    - e.g., `12-contributing-doc`
- Commit code changes (See commit [commit message guidelines](#Commit-Message))
    - `git add`
    - `npm run commit` (instead of `git commit`)
    - Squash unneeded commits
- Open pull request against the `develop` branch
- Gain approvals via code review (the "approved" label will be automatically added once you've gained enough approvals)
- Merge and close pull request

## Commit Message

Commit messages should follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) and include the closed issue number as a `trailer`. This will be formatted for you by running `npm run commit` instead of `git commit`.

Example:

```text

docs: app deployment

- README updated

Closes: #1
```

## Style Guide

*updated 1/31/2021*

**Battle Maps Color Scheme**
- Light Tan `#cab9a5`
- Dark Green `#052415`
- Dark Brown `#4b443c`
- Logo Blue `#27a9cd`
- Logo Brown `#714441`
- Logo Green `#a2c44f`

**Bootstrap Colors**

*Use custom CSS for colors only when necessary, most design should be possible with Bootstrap elements and these colors.*
- Primary `#0275d8`
- Secondary `#714441` (Logo Brown)
- Success `#a2C44f` (Logo Green)
    - For non-text elements, use `success` in place of `primary`
    - Default to this button type, esp. on light or dark backgrounds
- Danger `#b23542`
- Info `#27a9cd` (Logo Blue)
- Warning `#f6ad06`
- Light `#f8f9fa`
- Dark `#282420`
    - Secondary button type for case-by-case use, esp. on medium backgrounds 

**Fonts**
- [Cinzel](https://fonts.google.com/specimen/Cinzel)
    - Always appears uppercase
    - Titles and headings
- [IM Fell DW Pica](https://fonts.google.com/specimen/IM+Fell+DW+Pica)
    - Stylized body font
- [Roboto](https://fonts.google.com/specimen/Roboto)
    - Bootstrap default font family
    - Anywhere stylization isn't appropriate
