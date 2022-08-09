# Release Process
## Environments

* [Production][prod] - Run by SRE team in GCP
* [Stage][stage] - Run by SRE team in GCP
* [Dev][dev] - Run by ENGR team in Heroku
* Locals: Run by ENGRs on their own devices. (See [README][readme] and other [`docs/`][docs].)

## Code branches
Standard Relay development follows a branching strategy similar to
[GitHub Flow][github-flow], where all branches stem directly from `main` and
are merged back to `main`:

1. Create a branch from `main`
2. Make changes
3. Create a pull request to `main`
4. Address review comments
5. Merge pull request

```mermaid
%%{init: { 'theme': 'base', 'gitGraph': {'rotateCommitLabel': true} } }%%
    gitGraph
       commit
       branch change-1
       commit
       commit
       checkout main
       merge change-1
```

This means many features could be in development at the same time, and all can
merge back to `main` when they are ready.

```mermaid
%%{init: { 'theme': 'base', 'gitGraph': {'rotateCommitLabel': true} } }%%
    gitGraph
       commit
       branch change-1
       commit
       commit
       checkout main
       branch change-2
       commit
       checkout main
       merge change-1
       branch change-3
       commit
       commit
       checkout main
       merge change-2
       checkout change-3
       commit
       commit
       checkout main
```

## Release Timeline
The standard release interval for Relay is 1 week, meaning every week there
will be a new version of the Relay web app on the [Production][prod]
environment. To do this, we first release code to [Dev][dev] and
[Stage][stage].

## Release to Dev
~~Every commit to `main` is automatically deployed to the [Dev][dev] server.~~
(Since the [Great GitHub Heroku Incident of 2022][github-heroku-incident], we
have disabled GitHub integration on our Heroku app.)
We try to push `main` to [Dev][dev] often. To do so, you need to add the heroku
app as a remote:

* `heroku git:remote -a fx-private-relay`

Then, you can push your local `main` to heroku:

* `git push heroku main`

We can also push un-merged branches:

* `get push heroku change-1:main`


## Release to Stage
Every tag pushed to GitHub is automatically deployed to the [Stage][stage]
server. The standard practice is to create a tag from `main` every Tuesday at
the end of the day, and to name the tag with `YYYY-MM-DD` [CalVer][calver]
syntax. This tag will include only the changes that have been merged to `main`.
E.g., the following `2022.08.02` tag includes only `change-1` and `change-2`.

```mermaid
%%{init: { 'theme': 'base', 'gitGraph': {'rotateCommitLabel': true} } }%%
    gitGraph
       commit
       branch change-1
       commit
       commit
       checkout main
       branch change-2
       commit
       checkout main
       merge change-1
       branch change-3
       commit
       commit
       checkout main
       merge change-2 tag: "2022.08.02"
       checkout change-3
       commit
       commit
       checkout main
```

## Release to Prod
We leave the tag on [Stage][stage] for a week so that we (and especially QA)
can check the tag on GCP infrastucture before we deploy it to production. To
deploy the tag to production:

1. [Make a release on GitHub][github-new-release] for the tag.
   * Use the "Generate release notes" button!
2. File an [SRE ticket][sre-board] to deploy the tag to [Prod][prod].
   * Include a link to the GitHub Release

## Stage-fixes
Ideally, every change can ride the regular weekly release "trains". But
sometimes we need to make and release changes before the regularly scheduled
release.

### "Clean `main`" flow
If a bug is caught on [Stage][stage] in a tag that is scheduled to go to
[Prod][prod], we need to fix the bug before the scheduled prod deploy. If
`main` is "clean" - i.e., nothing else has merged yet, we can use the regular
GitHub Flow:

1. Create a stage-fix branch from `main`:
2. Make changes
3. Create a pull request to `main`
4. Address review comments
5. Merge pull request
6. Make and push a new tag

```mermaid
%%{init: { 'theme': 'base' } }%%
    gitGraph
       commit
       branch change-1
       commit
       commit
       checkout main
       branch change-2
       commit
       checkout main
       merge change-1
       branch change-3
       commit
       commit
       checkout main
       merge change-2 tag: "2022.08.02"
       checkout change-3
       commit
       commit
       checkout main
       branch stage-fix-1
       commit
       checkout main
       merge stage-fix-1 tag: "2022.08.02.01"
```

### "Dirty `main`" flow
If a bug is caught on [Stage][stage] in a tag that is scheduled to go to
[Prod][prod], we need to fix the bug before the scheduled prod deploy. If
`main` is "dirty" - i.e., other changes have merged, we can make the new tag
from the stage-fix branch.

1. Create a stage-fix branch from `main`:
2. Make changes
3. Create a pull request to `main`
4. Address review comments
5. Merge pull request
6. Make and push a new tag

```mermaid
%%{init: { 'theme': 'base' } }%%
    gitGraph
       commit
       branch change-1
       commit
       commit
       checkout main
       branch change-2
       commit
       checkout main
       merge change-1
       branch change-3
       commit
       commit
       checkout main
       merge change-2 tag: "2022.08.02"
       checkout change-3
       commit
       commit
       checkout main
       branch stage-fix-1
       commit tag: "2022.08.02.01"
       checkout main
       merge change-3
       merge stage-fix-1
```

## Example of 2 "clean main" releases
```mermaid
%%{init: { 'theme': 'base' } }%%
    gitGraph
       commit
       branch change-1
       commit
       commit
       checkout main
       branch change-2
       commit
       checkout main
       merge change-1
       branch change-3
       commit
       commit
       checkout main
       merge change-2 tag: "2022.08.02"
       checkout change-3
       commit
       commit
       checkout main
       branch stage-fix-1
       commit
       checkout main
       merge stage-fix-1 tag: "2022.08.02.01"
       checkout main
       merge change-3
       branch change-4
       commit
       checkout main
       branch change-5
       commit
       commit
       commit
       checkout main
       merge stage-fix-1
       merge change-4
       merge change-5 tag: "2022.08.09"
```

## Future
Since the "clean main" flow is simpler, we are working towards a release
process where `main` is *always* clean - even if changes have been merged to
it. To keep `main` clean, we will need to make use of feature-flags to
effectively hide any changes that are not ready for production. See the
[feature flags][feature-flags] docs for more.


[prod]: https://relay.firefox.com/
[stage]: https://stage.fxprivaterelay.nonprod.cloudops.mozgcp.net/
[dev]: https://dev.fxprivaterelay.nonprod.cloudops.mozgcp.net/
[readme]: https://github.com/mozilla/fx-private-relay/blob/main/README.md
[docs]: https://github.com/mozilla/fx-private-relay/tree/main/docs
[github-flow]: https://docs.github.com/en/get-started/quickstart/github-flow
[github-heroku-incident]: https://blog.heroku.com/april-2022-incident-review
[calver]: https://calver.org/
[sre-board]: https://mozilla-hub.atlassian.net/jira/software/c/projects/SVCSE/boards/316
[github-new-release]: https://github.com/mozilla/fx-private-relay/releases/new
