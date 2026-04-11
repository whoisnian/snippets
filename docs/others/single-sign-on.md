# 单点登录
* SSO: Single Sign-On，单点登录
* SLO: Single Log-Out，单点注销
* authn: authentication，身份验证
* authz: authorization，授权

## 常见协议
### LDAP
LDAP 客户端在处理用户登录逻辑时，有以下三种常见的认证方式：
* `AUTHENTICATED`: (Authenticated Search) 先使用 `bind-dn` 和 `bind-credential` 认证为管理员或具有搜索权限的用户，然后使用 `search-filter` 在 `base-dn` 下搜索用户，最后使用 `user-dn` 和 `user-password` 进行用户认证。
* `ANONYMOUS`: (Anonymous Search) 不需要认证为管理员，直接使用 `search-filter` 在 `base-dn` 下搜索用户，然后使用 `user-dn` 和 `user-password` 进行用户认证。
* `DIRECT`: (Direct Bind) 不需要搜索用户，直接从模板字符串得到用户的 DN，然后使用 `user-dn` 和 `user-password` 进行用户认证。

参考来源：
* [Apereo CAS: LDAP Authentication](https://apereo.github.io/cas/7.2.x/authentication/LDAP-Authentication.html)
* [LLDAP: Example configurations for tested clients](https://github.com/lldap/lldap/blob/bb2ea7bf36742665a3f275faacff5f0a71dfdef0/example_configs/README.md)

### OAuth 2.0
本质是授权而非认证，功能是已登录用户允许第三方应用访问某些资源。但常见的实现方式通常会关联身份验证步骤，例如：
* 未登录用户会被重定向到授权服务器的登录页面
* 给第三方应用发放的 `access_token` 可以用于请求用户信息，或者直接发放包含用户信息的 `id_token`

因此 OAuth 2.0 也可以用来实现单点登录功能。其中获取用户信息的规范主要来自 OIDC (OpenID Connect)，但具体实现细节可能存在差异。

参考来源：
* [DigitalOcean Tutorials: An Introduction to OAuth 2](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2)
* [GitHub Docs: Authenticating to the REST API with an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authenticating-to-the-rest-api-with-an-oauth-app)
* [Google for Developers: Sign in with Google: OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
* [OpenID Connect Core Spec: 5.3. UserInfo Endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)

### CAS
身份验证流程与 OAuth 2.0 的授权码模式类似，先是从第三方应用跳转到认证服务器进行登录，登录成功后带 ticket 重定向回第三方应用，第三方应用再使用 ticket 请求认证服务器验证用户身份并获取用户信息。  
官方实现是基于 Java 的 Apereo CAS，虽然提供 Docker 镜像但很难拿来直接用，执行 `docker run --rm --entrypoint=bash apereo/cas:7.3.6 -c "jar -tf cas.war | grep cas-server-support"` 可以看到官方镜像中只包含了以下模块：  
```
WEB-INF/lib/cas-server-support-actions-7.3.6.jar
WEB-INF/lib/cas-server-support-actions-core-7.3.6.jar
WEB-INF/lib/cas-server-support-captcha-core-7.3.6.jar
WEB-INF/lib/cas-server-support-configuration-metadata-repository-7.3.6.jar
WEB-INF/lib/cas-server-support-geolocation-7.3.6.jar
WEB-INF/lib/cas-server-support-person-directory-7.3.6.jar
WEB-INF/lib/cas-server-support-person-directory-core-7.3.6.jar
WEB-INF/lib/cas-server-support-pm-7.3.6.jar
WEB-INF/lib/cas-server-support-pm-core-7.3.6.jar
WEB-INF/lib/cas-server-support-pm-webflow-7.3.6.jar
WEB-INF/lib/cas-server-support-rest-7.3.6.jar
WEB-INF/lib/cas-server-support-rest-core-7.3.6.jar
WEB-INF/lib/cas-server-support-themes-7.3.6.jar
WEB-INF/lib/cas-server-support-themes-bootstrap-7.3.6.jar
WEB-INF/lib/cas-server-support-themes-core-7.3.6.jar
WEB-INF/lib/cas-server-support-throttle-7.3.6.jar
WEB-INF/lib/cas-server-support-throttle-core-7.3.6.jar
WEB-INF/lib/cas-server-support-thymeleaf-7.3.6.jar
WEB-INF/lib/cas-server-support-thymeleaf-core-7.3.6.jar
WEB-INF/lib/cas-server-support-token-core-api-7.3.6.jar
WEB-INF/lib/cas-server-support-validation-7.3.6.jar
WEB-INF/lib/cas-server-support-validation-core-7.3.6.jar
WEB-INF/lib/cas-server-support-webconfig-7.3.6.jar
```
例如 `Admin UI & Dashboard`、`JSON Service Registry` 这种常用模块都没有包含在内，因此只能通过 [CAS Initializr](https://getcas.apereo.org/ui) 基于官方模板自定义一个 Java 项目，再使用 Gradle 构建出 WAR 包来运行。  
此外官方 GitHub 仓库 [README.md](https://github.com/apereo/cas/blob/7a30e2a30c3f3014db805f2e224eaf7045f84058/README.md) 中的 [头图](https://github.com/user-attachments/assets/c2daa28c-cdfb-42a7-8333-db967cc3cce7) 充满 AI 感，让人很难绷得住。  

参考来源：
* [Apereo CAS: CAS Protocol 3.0 Specification](https://apereo.github.io/cas/7.3.x/protocol/CAS-Protocol-Specification.html)
* [Apereo CAS: WAR Overlay Initializr](https://apereo.github.io/cas/7.3.x/installation/WAR-Overlay-Initializr.html)

### SAML 2.0
通信格式基于 XML，身份验证流程与 OAuth 2.0 的授权码模式类似，但数据要求更复杂。  
先是第三方应用构造 AuthnRequest 后跳转到认证服务器进行登录，登录成功后带 SAML Response 再 POST 回第三方应用，第三方应用会遇到两种情况：
* SAML Response 中包含用户信息，第三方应用严格验证通过后，直接使用其中的用户信息
* SAML Response 中只包含一个 Artifact 的引用标识，第三方应用再构造 ArtifactResolve 请求到认证服务器获取用户信息

参考来源：
* [Apereo CAS: SAML2 Authentication](https://apereo.github.io/cas/7.3.x/authentication/Configuring-SAML2-Authentication.html)
* [SAML2 Specification: SP-Initiated SSO](https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0-cd-02.html#5.1.2.SP-Initiated%20SSO:%20%20Redirect/POST%20Bindings|outline)
