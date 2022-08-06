<br>
<div align="center">

  <!-- PROJECT LOGO -->
  <a href="https://github.com/Nerdware-LLC">
    <img src="https://github.com/Nerdware-LLC/.github/blob/main/profile/nerdware_logo.png" height="120" alt="Nerdware_Logo" />
  </a>

  <!-- PROJECT NAME/HEADER -->

  <h1>Nerdware Template Repository</h1>

  <!-- PROJECT TAGLINE -->

**🚀 An Awesome Template to Jumpstart Projects 🚀**

  <!-- PROJECT SHIELDS -->

[![pre-commit][pre-commit-shield]](https://github.com/pre-commit/pre-commit)
[![semantic-release][semantic-shield]](https://github.com/semantic-release/semantic-release)
[![license][license-shield]](/LICENSE)

</div>

---

<!-- TODO remove the below section upon completion of post-init setup -->

### **_Post-Initialization Setup_**

1. Update the [**.gitignore**](/.gitignore).

   - GitHub has some [awesome templates here](https://github.com/github/gitignore).
   - You can also query the [gitignore.io API](https://docs.gitignore.io/install/command-line) to find a list of recommended gitignore entries to suit virtually any type of project.

     ```bash
     # Obtain a list of available project-type options from the gitignore.io API.
     curl -sL https://www.toptal.com/developers/gitignore/api/list | sed 's/,/\n/g' > ./gitignore_io_api_options

     # Review the resultant list in "./gitignore_io_api_options" to find options that fit your project.
     # You can query gitignore entries for one or more options by separating them with commas.
     # For example, if your project will contain both Terraform and Terragrunt files:
     curl -sL https://www.toptal.com/developers/gitignore/api/terraform,terragrunt >> .gitignore
     ```

2. Set up [**pre-commit**](https://pre-commit.com/#install):

   1. Ensure it's [installed](https://pre-commit.com/#install) locally or in an executable image.
   2. Update the [**pre-commit config file**](/.pre-commit-config.yaml) with project-appropriate hooks and tools. The pre-commit project provides a complete list of [supported hooks here](https://pre-commit.com/hooks.html). Some popular hook sources:
      - ["Out-of-the-Box" pre-commit Hooks](https://github.com/pre-commit/pre-commit-hooks)
      - [pre-commit Hooks from gruntwork.io](https://github.com/gruntwork-io/pre-commit)
      - [Some Terraform-specific pre-commit Hooks](https://github.com/antonbabenko/pre-commit-terraform)
   3. Run `pre-commit install` to ensure local .git hooks are present.

3. Enable the [**Semantic-Release GitHub Action**][semantic-gh-action-url]:

   1. [Create a GitHub Personal Access Token][gh-pat-docs-url]. When creating the token, the minimum required scopes are:
      - `repo` for a private repository
      - `public_repo` for a public repository
   2. Add a [GitHub Secret][gh-action-docs-url] to your repo named "SEMANTIC_RELEASE_TOKEN" with the value set to the new PAT you created in the previous step.
   3. Once the secret has been added to your repo, update the [release.yaml workflow](/.github/workflows/release.yaml):
      - Update **on.push.paths** path glob "\*\*" to reflect only the project files that should trigger the Release workflow (e.g., "\*.js" or "\*.tf").
      - Delete the "**check-required-secret**" job (it was included so you can push initialization commits without triggering a bunch of failed GH Action runs).

   > Optionally, if you'd like to auto-assign GH Issues on release failures, you can add **assignees** to the "@semantic-release/github" plugin in [.releaserc.yaml](/.releaserc.yaml).

4. Remove this section from the README.

5. Profit 💰💰💰🥳🎉 <!-- https://knowyourmeme.com/memes/profit -->

## 🗺 Project Layout

- [`.github`](/.github) GitHub related files.

## 📝 License

All files and/or source code contained herein are for commercial use only by Nerdware, LLC.

See [LICENSE](/LICENSE) for more information.

<div align="center" style="margin-top:35px;">

## 💬 Contact

Trevor Anderson - [@TeeRevTweets](https://twitter.com/teerevtweets) - [T.AndersonProperty@gmail.com](mailto:T.AndersonProperty@gmail.com)

  <a href="https://www.youtube.com/channel/UCguSCK_j1obMVXvv-DUS3ng">
    <img src="https://github.com/trevor-anderson/trevor-anderson/blob/main/assets/YouTube_icon_circle.svg" height="40" />
  </a>
  &nbsp;
  <a href="https://www.linkedin.com/in/trevor-anderson-3a3b0392/">
    <img src="https://github.com/trevor-anderson/trevor-anderson/blob/main/assets/LinkedIn_icon_circle.svg" height="40" />
  </a>
  &nbsp;
  <a href="https://twitter.com/TeeRevTweets">
    <img src="https://github.com/trevor-anderson/trevor-anderson/blob/main/assets/Twitter_icon_circle.svg" height="40" />
  </a>
  &nbsp;
  <a href="mailto:T.AndersonProperty@gmail.com">
    <img src="https://github.com/trevor-anderson/trevor-anderson/blob/main/assets/email_icon_circle.svg" height="40" />
  </a>
  <br><br>

  <a href="https://daremightythings.co/">
    <strong><i>Dare Mighty Things.</i></strong>
  </a>

</div>

<!-- LINKS -->

[pre-commit-shield]: https://img.shields.io/badge/pre--commit-33A532.svg?logo=pre-commit&logoColor=F8B424&labelColor=gray
[semantic-shield]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-E10079.svg
[semantic-gh-action-url]: https://github.com/cycjimmy/semantic-release-action
[license-shield]: https://img.shields.io/badge/license-Proprietary-000080.svg?labelColor=gray
[gh-action-docs-url]: https://docs.github.com/en/actions/security-guides/encrypted-secrets
[gh-pat-docs-url]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
