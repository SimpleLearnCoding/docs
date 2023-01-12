# 使用 Pipeline 自动构建并部署

::: tip
以 Gitee 为例
:::

[[TOC]]

### 配置文件参考

```yaml
version: '1.0'
name: pipeline-deploy-to-test
displayName: Deploy-Test
triggers:
  trigger: auto
  push:
    branches:
      precise:
        - master
    commitMessages:
      include:
        - deploy.*
        - .*?
variables:
  REPO_NAME: repo-name
stages:
  - name: stage-87421f63
    displayName: 构建
    strategy: naturally
    trigger: auto
    executor:
      - linnzh
    steps:
#     根据项目下 Dockerfile 构建 docker 镜像
      - step: build@docker
        name: build_docker
        displayName: 镜像构建
        
#        请务必保证 repository 下存在一个与 gitee 个人空间地址 相同的命名空间
#        因为 Gitee Go 的镜像构建存在问题，无法指定命名空间，会将Gitee 的个人空间地址作为阿里云的命名空间使用
#        参考：https://juejin.cn/post/7130895772664463368
        type: account
        repository: registry.cn-hangzhou.aliyuncs.com
        username: 183****6666
        password: *********
        
        tag: ${GITEE_REPO}:${GITEE_BRANCH}
        dockerfile: ./Dockerfile
        context: ''
        artifacts: []
        
#       开启 Docker 缓存之后会导致 Gitee Go 没有权限写入缓存
        isCache: false
        
#       Docker 镜像的 --build-args 参数
        parameter:
          timezone: Asia/Shanghai
        notify: []
        strategy:
          retry: '0'

#       部署至服务器
      - step: shell@agent
        name: execute_shell
        displayName: Shell 脚本执行
        # 主机组信息
        hostGroupID:
          ID: Server-ID
          hostID:
            - xxxxxxxxxxxxxx
        script:
          - echo 'Hello ${GITEE_REPO}!'
          - docker rm ${REPO_NAME} -f
          - docker run -itd --name=${REPO_NAME} -p=9511:9501 -v=/codes/${REPO_NAME}/.env:/opt/www/.env --network=docker_network_default ${GITEE_DOCKER_IMAGE}
        strategy:
          retry: '0'
        dependsOn: build_docker
```
