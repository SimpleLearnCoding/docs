# TDD 项目实战 70 讲 - 笔记



> 该课程来源于[极客时间](https://time.geekbang.org/)的[徐昊 · TDD 项目实战 70 讲](https://time.geekbang.org/column/intro/100109401)。

[[TOC]]

## 开篇词｜为什么TDD是当前最具工程效能的研发流程？



1. 私有方法该如何测试？
   1. 创建一个公开的 Helper 类，将私有代码 refactor 至该 Helper 类的一个**静态公开**方法，对该方法进行测试
   2. 并将该私有方法的代码返回至 Helper 类静态方法（避免重复代码，也方便测试）
2. `工程效能不仅仅是开发功能的效能，还包含发现问题、定位问题以及修复问题的效能。`
   1. 这句话感觉可以提取为：具备快速发现问题、定位问题以及修复问题的能力（写在简历里）
3. Resource 概念
   1. 通过视频可以发现他用了一个 resource 的概念来构建API，同理我项目里也可以用这种形式来自动生成API（大部分框架应该都支持），避免手动写各式代码，并且根据应用场景不同可以生成不同场景下的resource。
   2. 经实践，Hyperf 并未有快速创建 CRUD 路由的相关命令，但是仍然可以用 resource 来制定不同场景下的信息输出。
   3. `当构建 API 时，你往往需要一个转换层来联结你的 Model 模型和实际返回给用户的 JSON 响应。资源类能够让你以更直观简便的方式将模型和模型集合转化成 JSON。`（来自 Hyperf 官方文档）
   4. `从本质上来说，资源的作用很简单。它们只需要将一个给定的模型转换成一个数组。所以每一个资源都包含一个 toArray 方法用来将你的模型属性转换成一个可以返回给用户的 API 友好数组`（来自 Hyperf 官方文档）
4. 重构之前，先对要重构的代码编写测试
   1. 编写新功能也是如此——测试先行
5. 控制代码行数——一个方法内代码行数最好不超过 10 行
6. `测试驱动开发，从名字上看很容易误解为不过是调换了写实现代码和测试代码顺序的一种开发方式，但实则不然。通过先写测试来不断地对自我进行验证和提问：对需求是否了解？对当前项目架构是否了解？当前架构是否到了需要演化的时间节点？来加强自身对需求和架构的关注，进而达到优化架构的目的。`
7. `在团队协作的环境下，做 TDD 时需要先对需求进行任务拆解。换句话说，当任务拆分完成后，实际上就向团队中的所有人表明了我们是怎么理解需求的，将计划怎么去实现它。`
   1. 拿到需求后，需要将需求**拆分**，拆分过程中逐渐理解需求，并将拆分的需求转化为一个个切实有效的测试任务，才算真正理解了需求
   2. 即：**需求、功能点、任务项、测试**
8. `重构讲的是，我希望它的功能不变，结构变得更好。也就是代码功能本身不变，但是需要让代码结构变得更好。这意味着什么呢？意味着重构调整的是架构。`



## 01｜TDD演示



### （1）：任务分解法与整体工作流程



1. TDD 基本原则：
   1. **当且仅当存在失败的自动化测试时，才开始编写生产代码**
   2. **消除重复**
2. 根据 TDD 的基本原则，Kent Beck 将开发工作分成了三步，也就是后世广为流传的测试驱动开发咒语——`红/绿/重构（Red/Green/Refactoring）`：
   1. **红：编写一个失败的小测试，甚至可以是无法编译的测试；**
   2. **绿：让这个测试快速通过，甚至不惜犯下任何罪恶；**
   3. **重构：消除上一步中产生的所有重复（坏味道）。**
3. 任务分解法的步骤如下：
   1. 大致构思软件被使用的方式，把握对外接口的方向；
   2. 大致构思功能的实现方式，划分所需的组件（Component）以及组件间的关系（所谓的架构）。当然，如果没思路，也可以不划分；
   3. 根据需求的功能描述拆分功能点，功能点要考虑**正确路径（Happy Path）**和**边界条件（Sad Path）**；
   4. 依照组件以及组件间的关系，将功能拆分到对应组件；
   5. 针对拆分的结果编写测试，进入`红/绿/重构`循环。
4. API 组件划分时，首先考虑使用者的感受——即整体对外接口的部分，然后考虑实现。
5. 在一个功能确定时，可以考虑最容易想到的 Happy Path 和 Sad Path，并在测试中使用 **TODO注释** 来拆解任务，而不是东一榔头西一棒槌、想一出是一出。



### （2）：识别坏味道与代码重构



1. 测试通过后，可以通过查看代码中存在的 **Bad Smell** 来对代码进行重构（前提是测试全部通过）。
2. **分支语句**可以通过**多态**来替换分支（可参考：抽象工厂模式，抽取接口）。同时，代码修改后需要执行测试，确保测试通过，**保持小步骤且稳定的节奏，逐步完成重构。**
3. 重构时因为测试的存在，可以只关注**如何让代码变得更好**，不至于丧失重构的勇气、不惧怕功能被破坏。
4. IDE 的各种重构功能：提取方法/类、重命名、抽取接口等。
5. 旧项目可以先写小功能的测试，测试通过后，可以对小功能代码进行重构：代码重复、条件分支等。



### （3）：按测试策略重组测试



1. 代码重构之后，原先的测试可能覆盖范围不足，难以发现问题。此时可选择**粒度更小**的测试，更有益于问题的定位，同时也将测试放在合适的位置。
2. `任务列表是一个随代码结构（重构）、测试策略（在哪个范围测试）、代码实现情况（存在哪些缺陷）等因素而动态调整的列表。它的内容体现了我们最新的认知，它的变化记录了我们认知改变的过程。`
   1. 即测试代码也需要重构，可通过测试用例理解业务逻辑。
   2. 随着重构的进行，有些测试可能是**过时/重复**（即被其他粒度更小的测试覆盖）的，需要及时**清除/重构**它！
3. 对于自己发现的 BUG，应该预测其产生条件、编写相关测试，最后才是 fix it！
   1. 对于**自己不知道的BUG**，更多的是需要进行**交叉校验**，例如：代码审查、结对编程等。



### （4）：实现对于列表参数的支持



1. 代码中可能存在**意图不明/不直观**的部分，有时候我们可以采用**代码注释**的方式来阐述意图，`不过更推荐的方式是，通过抽取方法，让方法名成为注释。`
   1. 或者换一种更容易理解的方法来实现相同的功能。
   2. 例如判断索引位置时，可以提取一个方法为「获取目标列表」，然后通过判断列表长度来进行重构。
2. 代码重构后，由于结构变更，可能和其他部分的代码存在重复，这时应该通览代码，检查是否存在隐含的重复，然后**消除重复**（可使用：抽取接口、封装抽象类然后继承等方式）。当然最后不要忘记跑一边测试，确保功能没有问题——始终贯彻**红/绿/重构**的流程！



#### TDD 的三个特点：

- 将要完成的功能分解为一系列任务，再将任务转化为测试，**以测试体现研发进度**，将整个开发过程变成有序的流程，以减少无效劳动。
- 在修改代码时，**随时执行测试以验证功能**，及时发现错误，降低发现、定位错误的成本，降低修改错误的难度。
- 时刻感受到认知的提升，增强自信、降低恐惧。





## 02｜TDD 中的测试



> 自本章节开始，笔记内容分了重点，对于更详细的内容不再进行说明。





### 测试的基本说明



#### 阶段

1. 初始化 - SetUp
2. 执行测试 - Exercise
3. 验证结果 - Verify
   1. 两种验证方式：状态验证（State Verify）、行为验证（Behavior Verify）
   2. 尽可能使用**状态验证**而避免使用行为验证。
   3. 状态验证：指在与待测系统交互后，通过比对测试上下文与待测系统的状态变化，判断待测系统是否满足需求的验证方式。
   4. 行为验证：指通过待测系统与依赖组件（Depended On Component）的交互，来判断待测系统是否满足需求的验证方式。
      1. 行为验证会大量使用测试替身技术，但并不是所有的测试替身都是行为验证。
      2. 仅对测试方法调用的外部组件使用测试替身。
4. 复原 - Teardown



#### 测试上下文 / Test Context



也被称为**测试夹具**（Test Fixture）。可理解为：驱动待测系统的交互接口，也叫 **Driver**。

测试上下文的设置将直接影响编写测试的难度，以及维护测试的成本。



## 03｜TDD 中的驱动



> TDD“驱动”的是架构，因而实际是一种架构技术。
>
> 
>
> 通过重构到模式演进式地获得架构，是一种实效主义编码架构风格（Pragmatic Coding Architect）。



- 测试驱动开发的主要关注点在于功能在单元（模块）间的分配，而对于模块内怎么实现，需要你有自己的想法。
- 不同的实现策略，隐含着不同的功能上下文划分。
- 单元级别功能测试能够驱动其对应单元（功能上下文或变化点）的外在功能需求。而对于对应单元之内功能的实现，测试就没有办法了。
- 单元级别功能测试无法驱动小于其测试单元的功能需求，也无法驱动单元内的实现方式，需要进一步拆分功能上下文才可以。而指引功能上下文拆分的方式有很多，比如有不同的实现思路、架构等。



### 几种重构的基本手法



- 语义化的查找替换（Semantic Find and Replace）
  - 在不破坏现在代码结构的前提下，完成查找替换
  - 提取方法（Extract Method）和内联方法（Inline Method）
- 通过提取 / 合并单元进行重架构（Extract and Merge Units）
  - 将提取出的行为从当前对象中分离出去，也就是提取对象（Extract Object）
  - 一旦提取出对象，我们就能通过类内字段（Field）、参数（Parameter）等方式，不再直接引用当前对象上下文，从而将其与当前对象上下文分离。
  - 对应地，我们可以使用的重构手法有引入字段（Introduce Field）、引入参数（Introduce Parameter）等。
- 使用多态替换条件
  - 对修改封闭，对扩展开放





### 重构到模式



重构到模式，或者说 TDD 红 / 绿 / 重构 循环中的重构，是在完成功能的前提下以演进的方式进行设计。这是**延迟性决策策略**，也叫**最晚尽责时刻**（Last Responsible  Moment，LRM）。

也就是说，与其在信息不足的情况下做决定，不如延迟到信息更多，或是不得不做出决策的时机再决策。

这种策略的重点在于，在保持决策有效性的前提下，尽可能地推迟决策时间。

如果架构愿景不清晰，那么“最晚尽责时刻”让我们不必花费时间进行空对空的讨论，可以尽早开始实现功能，再通过重构从可工作的软件（Working Software）中提取架构。

这种方式也被称作 TDD 的**经典学派（Classic School）或芝加哥学派（Chicago  School）**。



还有一种 TDD 风格，被称作 TDD 的**伦敦学派（London School）**——**一种利用架构愿景分割功能上下文，然后再进入经典模式的 TDD 方法**——适用于<u>架构愿景已经比较清晰</u>的情况。

这么做的好处是，对于复杂的场景，可以极大简化构造测试的时间。



### 总结



> 将所有直接耦合都视为坏味道的设计取向，会将功能需求的上下文打散到一组细碎的对象群落中，增加理解的难度，最终滑向**过度设计（Over Design）**的深渊。



使用 TDD  的核心流程为：

- 首先将需求分解为功能点，也就是将需求转化为一系列可验证的里程碑点；
- 如果已经存在架构或架构愿景，则依据架构中定义的组件与交互，将功能点分解为不同的功能上下文；
- 如果尚不存在架构愿景，则可以将功能点作为功能上下文；
- 将功能点按照功能上下文，分解为任务项。也就是进一步将可验证的里程碑点，分解为功能上下文中可验证的任务项；
- 将任务项转化为自动化测试，进入红 / 绿 / 重构循环，驱动功能上下文内的功能实现；
- 如果重构涉及功能上下文的重新划分，即提取 /  合并组件，即视作对于架构的重构与梳理。需调整后续功能点中对于功能上下文以及任务项的划分。
- 如此往复，直到所有功能完成。