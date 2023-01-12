import{_ as l,c as i,o as t,a}from"./app.82c112fd.js";const _=JSON.parse('{"title":"数据分析 - 入门","description":"","frontmatter":{},"headers":[{"level":2,"title":"基本知识","slug":"基本知识","link":"#基本知识","children":[{"level":3,"title":"工作日常","slug":"工作日常","link":"#工作日常","children":[]},{"level":3,"title":"基本技能/参考","slug":"基本技能-参考","link":"#基本技能-参考","children":[]},{"level":3,"title":"实际运用","slug":"实际运用","link":"#实际运用","children":[]}]}],"relativePath":"other/data-analysis-start.md","lastUpdated":1673516865000}'),o={name:"other/data-analysis-start.md"},r=a('<h1 id="数据分析-入门" tabindex="-1">数据分析 - 入门 <a class="header-anchor" href="#数据分析-入门" aria-hidden="true">#</a></h1><blockquote><p>本笔记来自「路人甲」公众号提供的一份数据分析资料。</p></blockquote><nav class="table-of-contents"><ul><li><a href="#基本知识">基本知识</a><ul><li><a href="#工作日常">工作日常</a></li><li><a href="#基本技能-参考">基本技能/参考</a></li><li><a href="#实际运用">实际运用</a></li></ul></li></ul></nav><h2 id="基本知识" tabindex="-1">基本知识 <a class="header-anchor" href="#基本知识" aria-hidden="true">#</a></h2><p>主要是收集的一些资料，用来大致了解这个行业以及需要具备的基本能力。</p><h3 id="工作日常" tabindex="-1">工作日常 <a class="header-anchor" href="#工作日常" aria-hidden="true">#</a></h3><ol><li><p>产生数据</p><ol><li>每当业务上有新的功能点需要开发上线的时候，数据分析师需要去围绕着这些功能会产生哪些业务变化、这个功能上线的目的是什么、上线之后该如何衡量效果等一系列问题，在功能上线前做好数据的埋点、以及可以衡量最终效果的指标。这样当功能上线的时候，你可以快速的衡量业务效果。</li></ol></li><li><p>提供数据</p><ol><li>提供数据可能是作为一个数据分析师每天都要做的事情，甚至有时候大半天都在做这件事情。</li><li>数据需求的来源是多方的，各种业务方以及产品经理。</li><li>商业数据分析师是公司业务方面的数据的出口，为了能准确的给需求方提供数据，你需要跟业务方有充分的沟通，对公司的数据维度有详细的了解。</li></ol></li><li><p>解释数据</p><ol><li><p>这些数据是怎么来的？好的数据坏的数据都需要去知道，那样才能取长补短。例如：</p><ol><li>春节期间用户购买vip的数量翻了一倍，为什么翻倍了？</li><li>上周的用户留存降低了几个百分点，为什么降低？</li><li>知乎的最近一周的活跃用户答题量下滑几个百分点？</li></ol><p>等等这些问题，都需要你一步一步的深入挖掘，而这背后的真正原因能够快速的做出预警或者给之后的发展一些很好的idea。</p></li></ol></li><li><p>探索数据</p><ol><li><p>光有解释数据是不够的，因为数据分析并不是解决能看出来的问题，还要能提出发现解决一些探索性的问题。</p><ol><li>给新用户怎样的激励，才能让他们的次日留存达到最佳？比方说Linkedin探索出来的让新用户拥有六个以及以上好友可以很好提高他们的留存。</li></ol><p>探索数据通常是一个长期的比较大的项目，探索数据并不存在一个标准的答案，也通常可能是几个月出不了一个好的结论。</p></li></ol></li><li><p>影响数据</p><ol><li>A/B Test是为了探索更好的方向，更受用户喜欢的功能。</li><li>通过数据论证可以说服业务方听询数据分析师的意见。 <ol><li>推送的消息文本应该怎么发？发给几个实验组看看效果；</li><li>这个按钮应该设计成什么颜色，配上什么文字？多设计几套上线几个不同分组看效果。</li></ol></li><li>通过不断的A/B Test，数据分析师会更好的辅助产品的迭代，影响数据的产生。</li></ol></li></ol><h3 id="基本技能-参考" tabindex="-1">基本技能/参考 <a class="header-anchor" href="#基本技能-参考" aria-hidden="true">#</a></h3><p>数据分析师的能力分为：<strong>分析能力和业务能力</strong>，<strong>分析能力决定一个数据分析师的下限，业务能力决定一个数据分析师的上限。</strong></p><p>数据分析的基础之一是<strong>有数据</strong>。分析能力相对来说是死板的，通常需要掌握以下技能：</p><ul><li>数据分析常用哪些算法？</li><li>需要用到哪些库？</li><li>如何进行计算？</li><li>进行可视化，每一种图表的用途是什么？</li></ul><p>为解决以上问题，推荐阅读书籍：<strong>《利用Python进行数据分析》、《SciPy and NumPy》</strong>。</p><p>计算和可视化工具有：<strong>Tableau</strong>。</p><p>可以考虑的爬虫数据来源：<strong>豆瓣图书</strong>。并借豆瓣的数据分析以下问题：</p><ul><li>书籍的数量是否随着时间增长？</li><li>书籍的评分与年代之间是否有某种关系？</li><li>书籍的价格一般都是在什么范围？</li><li>随着时间的推移，书籍价格是否越来越贵？</li><li>历史的长河中，哪个出版社出版的书籍最多？</li><li>哪个出版社出版的书籍评分比较高？</li><li>高产出的作者有哪些？</li><li>有哪些评分和作品数量都很高的作者？</li><li>书籍的评分与评论数量之间存在某种关系吗？</li><li>书籍评论的关键字云</li><li>最后，推荐一些书籍和作者</li></ul><p>以上问题涉及的数据维度有：书名、作者、出版社、出版时间、豆瓣评分、价格、打分人数、评论人数、具体评论、国家/地区等。然后以不同维度切入，进行分析。</p><p>还可以引出其他问题，例如书籍的领域（计算机、艺术等）、专业领域下哪个作者书籍质量最佳/最受欢迎等。</p><p>根据时间维度得出一些结论，然后探索其原因：为什么这个时间点、该领域书籍数量高速增长？</p><p>需要注意的是，数据中可能存在一些干扰因素或不正常的数据，需要在分析过程中剔除。</p><p>另外豆瓣还有一个项目：<strong>豆瓣电影</strong>。</p><p>在分析过程中，根据问题，将数据制成符合场景的图表（例如排行榜类可使用柱状图、热门程度可使用热力图等），以此锻炼自己的<strong>数据感知能力</strong>、<strong>图表了解程度</strong>、<strong>基本算法和分析</strong>。步骤基本如下：</p><ol><li>提问题：我想做什么？分析什么？</li><li>抽象数据：是否有数据能提供支持？</li><li>获取数据：并且清洗，并不需要百分百的准确度，避免陷入数据精确度的陷阱，浪费大量时间</li><li>分析数据：利用语言或工具对数据进行有目的的分析</li></ol><p>其中最难的属于第一步：提问。这需要在项目中不断培养积累。</p><p>也可以通过阅读一些相关书籍来<strong>建立基本问题框架</strong>：<strong>《数据之美》</strong>、<strong>《啤酒与尿布》</strong>、<strong>《深入浅出数据分析》</strong>。在不知道从何下手时，就从最基本、最常见的问题开始。</p><p><strong>最重要的是，先开始。</strong></p><p>如果困扰于数据源的问题，可以在 Tableau 官网入门，其免费的官方视频资源已经配备了对应的数据源。</p><p>（但是 Tableau 收费且贵😭）</p><h3 id="实际运用" tabindex="-1">实际运用 <a class="header-anchor" href="#实际运用" aria-hidden="true">#</a></h3><p>根据自己的目标，有意识地去了解相关内容。例如一个公众号的运营，「路人甲」公众号提出的<strong>经常分析研究精华回答</strong>：</p><ul><li>精华回答就是知乎社区或者话题下赞同数量最多的回答，答案赞同越多答主曝光率越高，那么被关注的机会就越大，那么如何写一个高赞精华回答就很重要。</li><li>如何写高赞的回答？把擅长的话题或者知乎的根话题下所有精华回答拉出来，拿一个笔记本对每一个回答做归类做分析，学习高赞回答的文风、思路。</li><li>当然，并不是所有的高赞回答都会增粉的，那么这些就是需要结合具体的回答以及回答者的涨粉情况去慢慢分析琢磨了。</li></ul><p>按照这个思路，就是<strong>在日常中，有意识地分析他人的思路</strong>，哪怕想不明白，分析多了，自己也能学会多一种思考方法。这就是<strong>借鉴</strong>。而不是<strong>只会哈哈哈</strong>。</p><p>另外，数据分析有利于在我们日常生活中做决策、提供更多选择（而非“Yes or No”的二选题），也避免在情绪化时作出冲动决策。它不一定是正确的，但可以帮助自己厘清思路、减少其他因素的干扰。</p>',32),e=[r];function n(s,p,d,h,g,c){return t(),i("div",null,e)}const f=l(o,[["render",n]]);export{_ as __pageData,f as default};
