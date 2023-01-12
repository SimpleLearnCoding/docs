import{_ as s,c as n,o as a,a as l}from"./app.37b40e21.js";const F=JSON.parse('{"title":"使用 Pipeline 自动构建并部署","description":"","frontmatter":{},"headers":[{"level":3,"title":"配置文件参考","slug":"配置文件参考","link":"#配置文件参考","children":[]}],"relativePath":"deploy/GiteeCI.md","lastUpdated":1673507275000}'),p={name:"deploy/GiteeCI.md"},e=l(`<h1 id="使用-pipeline-自动构建并部署" tabindex="-1">使用 Pipeline 自动构建并部署 <a class="header-anchor" href="#使用-pipeline-自动构建并部署" aria-hidden="true">#</a></h1><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>以 Gitee 为例</p></div><nav class="table-of-contents"><ul><li><a href="#配置文件参考">配置文件参考</a></li></ul></nav><h3 id="配置文件参考" tabindex="-1">配置文件参考 <a class="header-anchor" href="#配置文件参考" aria-hidden="true">#</a></h3><div class="language-yaml line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#F07178;">version</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">1.0</span><span style="color:#89DDFF;">&#39;</span></span>
<span class="line"><span style="color:#F07178;">name</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">pipeline-deploy-to-test</span></span>
<span class="line"><span style="color:#F07178;">displayName</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Deploy-Test</span></span>
<span class="line"><span style="color:#F07178;">triggers</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">trigger</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">auto</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">push</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">branches</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">      </span><span style="color:#F07178;">precise</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">master</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">commitMessages</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">      </span><span style="color:#F07178;">include</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">deploy.*</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">.*?</span></span>
<span class="line"><span style="color:#F07178;">variables</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">REPO_NAME</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">repo-name</span></span>
<span class="line"><span style="color:#F07178;">stages</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#F07178;">name</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">stage-87421f63</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">displayName</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">构建</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">strategy</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">naturally</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">trigger</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">auto</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">executor</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">      </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">linnzh</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">steps</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">#     根据项目下 Dockerfile 构建 docker 镜像</span></span>
<span class="line"><span style="color:#A6ACCD;">      </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#F07178;">step</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">build@docker</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">name</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">build_docker</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">displayName</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">镜像构建</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">#        请务必保证 repository 下存在一个与 gitee 个人空间地址 相同的命名空间</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">#        因为 Gitee Go 的镜像构建存在问题，无法指定命名空间，会将Gitee 的个人空间地址作为阿里云的命名空间使用</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">#        参考：https://juejin.cn/post/7130895772664463368</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">type</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">account</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">repository</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">registry.cn-hangzhou.aliyuncs.com</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">username</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">183****6666</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">password</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">*</span><span style="color:#A6ACCD;">********</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">tag</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">\${GITEE_REPO}:\${GITEE_BRANCH}</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">dockerfile</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">./Dockerfile</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">context</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;&#39;</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">artifacts</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[]</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">#       开启 Docker 缓存之后会导致 Gitee Go 没有权限写入缓存</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">isCache</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FF9CAC;">false</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">#       Docker 镜像的 --build-args 参数</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">parameter</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">          </span><span style="color:#F07178;">timezone</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Asia/Shanghai</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">notify</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[]</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">strategy</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">          </span><span style="color:#F07178;">retry</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">0</span><span style="color:#89DDFF;">&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">#       部署至服务器</span></span>
<span class="line"><span style="color:#A6ACCD;">      </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#F07178;">step</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">shell@agent</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">name</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">execute_shell</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">displayName</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Shell 脚本执行</span></span>
<span class="line"><span style="color:#89DDFF;">        </span><span style="color:#676E95;font-style:italic;"># 主机组信息</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">hostGroupID</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">          </span><span style="color:#F07178;">ID</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Server-ID</span></span>
<span class="line"><span style="color:#A6ACCD;">          </span><span style="color:#F07178;">hostID</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">            </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">xxxxxxxxxxxxxx</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">script</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">          </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">echo &#39;Hello \${GITEE_REPO}!&#39;</span></span>
<span class="line"><span style="color:#A6ACCD;">          </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">docker rm \${REPO_NAME} -f</span></span>
<span class="line"><span style="color:#A6ACCD;">          </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">docker run -itd --name=\${REPO_NAME} -p=9511:9501 -v=/codes/\${REPO_NAME}/.env:/opt/www/.env --network=docker_network_default \${GITEE_DOCKER_IMAGE}</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">strategy</span><span style="color:#89DDFF;">:</span></span>
<span class="line"><span style="color:#A6ACCD;">          </span><span style="color:#F07178;">retry</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">0</span><span style="color:#89DDFF;">&#39;</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#F07178;">dependsOn</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">build_docker</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br></div></div>`,5),o=[e];function r(c,t,y,D,i,C){return a(),n("div",null,o)}const b=s(p,[["render",r]]);export{F as __pageData,b as default};
