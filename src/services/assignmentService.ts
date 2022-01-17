import { feedbackCategories } from "./feedbackService";
import { users } from "./userService";

const assignmentService = {
  async getAll(): Promise<Assignment[]> {
    return Promise.resolve(
      assignments.map(({ feedbackCategoryIds, ...rests }) => ({
        feedbackCategories: feedbackCategoryIds.map(
          (id) => feedbackCategories[id]
        ),
        ...rests,
      }))
    );
  },

  async getOne(id: number): Promise<Assignment> {
    const { feedbackCategoryIds, ...rests } = assignments[id];
    return Promise.resolve({
      feedbackCategories: feedbackCategoryIds.map(
        (id) => feedbackCategories[id]
      ),
      ...rests,
    });
  },

  async postOne(assignmentDto: AssignmentDto) {
    const newAssignment: AssignmentModel = {
      id: assignments.length,
      ...assignmentDto,
    };
    assignments.push(newAssignment);
    return Promise.resolve(newAssignment);
  },

  async deleteOne(targetId: number) {
    assignments = assignments.filter(({ id }) => id !== targetId);
    return Promise.resolve(true);
  },

  getSubmissionStatuses(id: number): Promise<SubmissionStatus[]> {
    return Promise.resolve(
      users.map(({ academicId, firstName, lastName }, idx) => ({
        academicId,
        firstName,
        lastName,
        isGraded: false,
        playCount: 3,
        submissionDateTime: new Date().toLocaleDateString(),
        submissionId: idx % 3,
      })) as SubmissionStatus[]
    );
  },
};

export default assignmentService;

export let assignments: AssignmentModel[] = [
  {
    id: 0,
    assignmentType: "translate",
    name: "한->일 번역과제",
    description: "설명없음",
    textFile:
      "우리는 별생각 없이 ‘밥이나 한번 먹읍시다’ 라던가 ‘조만간 한번 뵙지요’ 등의 약속 아닌 약속을 남발하는경우가 많다. 이처럼 ‘지켜지리라’는 믿음 혹은 ‘지키겠다’는 의지도 없이, 우리에게는 이런 ‘빈말’들이체면치레나 격식에 가까운 인사말로 건네지는 경우를 종종 보게 된다. 이런 ‘약속’들이 가벼운 말치레가 되어버린 지금, 우리는 그 약속이 의미하는 실제 말의 힘과 단순히 가볍게오가는 인사말 사이에 벌어져 있는 의미의 간극을 헤아릴 줄 알아야 한다. ‘아’로 말하고 ‘어’로 들어야 하는절묘한 언어행위가 지어내는 행간을 읽고, 속내를 들여다보는 재주도 필요하다. 우리 삶의 곳곳에는 또 크고 작은 공공의 약속들이 있다. 이들은 사회의 안정과 질서를 위해서 서로에게암묵적으로 지켜질 것을 전제로 작동한다. 아스팔트 위에 그어진 노란 선 하나도 하나의 약속이고, 자동차를운전하면서, 혹은 건널목 앞에서 하염없이 바라보는 신호등의 삼색도 하나의 약속이다. 참으로 별것 아닌 것같아 보여 그것이 약속이었다는 것조차 잊고 살지언정, 그 의미를 곱씹어 보면 우리의 생명과 직결되어 있는수많은 약속들이 지켜질 것을 기대하면서 도처에 산재해 있음을 알 수 있다. 우리는 언어가 없는 세상을 상상조차 할 수 없다. 많은 종교들에서 행하는 가장 고통스런 수행 가운데 하나가‘묵언수행’이다. 그만큼 한번 말을 하는 능력을 갖게 되면, 그것을 덜어내는 것은 목숨을 잃는 것과도 같은무게감을 가진다. 그럼에도 한없이 가벼워진 말치레들은 때로는 삶을 지탱하는 믿음의 무게 또한 가벼이여겨도 좋다는 신호가 되어버린 것은 아닐까.",
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 2,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 1,
    assignmentType: "translate",
    name: "일->한 번역과제",
    description: "설명없음",
    textFile:
      "翌日のことが頭をよぎり、どことなく晴れ晴れしい気分になれない「日曜の夜」を過ごしてきた多くの人が、さかいまさと堺 雅 人主演の「はんざわなおき半沢直樹」のおかげで今、テレビに前のめりになっているだろう。素晴らしいドラマは私たちの気持ちを鼓舞し、日々の生活に大きな影響さえ与える。エンターテインメントは「必要不可欠」なものだ。並々ならぬ半沢ファンを自負する私だが、正直なところ今回は前回ほどの話題作となるのか、少々心配もしていた。前作から７年間のブランクは長すぎたのでは？という気もしたし、コロナ社会に生きる私たちにとって、勧善懲悪を痛快に打ち出す半沢の「倍返し」的世界観が、響きにくくなっているのではないか？という思いがぬぐえずにいた。だが、すでに多くの読者がご存じのとおり、全く杞憂だった。ドラマの内容はもちろん、演者、作り手、全てのスタッフが一丸となり、視聴者に喜んでもらえる作品を提供しようとする「熱」が、ひとつひとつのシーンににじんでいる。今、「半沢直樹」を心の応援旗として、日々を頑張る人も多いだろう。これだけの作品となれば、アンチも増える。ＳＮＳを通じてあらを探すことを生きがい（？）とする人もいるようだ。だが、それもありだろう。大いに語りあい、さらに盛り上がっていけばいい。",
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 2,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 2,
    assignmentType: "sequential",
    name: "한->일 순차통역과제",
    description: "설명없음",
    textFile:
      '미국과 중국이 지난주 알래스카 고위급 회담에서 첨예한 갈등을 재확인한 가운데 중국은 이번 주 러시아외무장관의 방중을 통해 대미 견제를 위한 전략적 연대 강화에 나선다.중국 언론에 따르면 러시아 외무장관은 중국 외교부장의 초청으로 오는 22일부터 23일까지 중국을 공식방문한다. 지난 18~19일(현지시간) 알래스카에서 미중회담이 격렬한 언쟁 끝에 공동성명도 내지 못하고마무리한 뒤 이뤄지는 것이라는 점에서 주목된다.그동안 시진핑(習近平) 중국 국가 주석과 푸틴 러시아 대통령은 공개적으로 친분을 과시하면서 중러 전략적연대 강화를 통해 미국의 압박에 대응해왔다는 점에서 이번 러시아 외무장관의 방중 또한 대미 견제구일가능성이 크다.중국 외교부는 이번 외무장관 회담에서 국제 및 지역 문제에 대해 폭넓게 의견을 교환할 예정이라고 밝혀미국을 겨냥한 중러 간 공동 대응 성명 등이 나올 것으로 예상된다.베이징의 한 소식통은 "알래스카 회담에서 중국이 미국의 강경한 입장을 재확인한 만큼 중국의 러시아에대한 의도적인 밀착은 가속할 것으로 보인다"고 하면서 조 바이든 미국 행정부의 지나친 압박이 오히려핵보유국인 중국과 러시아의 밀착을 유도하고 있다고 지적했다. 또 다른 전문가는  "신냉전이 도래했다고 말하기엔 아직 이르지만 미국은 경쟁국인 중국과 러시아를견제하기 위해 신냉전을 원하고 있다"고 말했다.환구시보(環球時報)와 글로벌타임스는 공동 사설에서 "미국이 거만한 태도로 중국과 러시아에 대한 동시압박을 가중하고 있다면서 "미국은 자신을 해치는 게임을 하고 있으며 이는 동맹국들에도 이로운 것이없다"고 강조했다.',
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 1,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 3,
    assignmentType: "simultaneous",
    name: "한->일 동시통역과제",
    description: "설명없음",
    textFile:
      "米国で１８日に行われた米中外交トップ会談に向け、バイデン政権は先進７カ国（Ｇ７）や日米豪印４カ国（クアッド）の枠組みをてこ入れし、日本や韓国、欧州諸国との同盟関係強化に努めた。中国は「反中包囲網」（外務省報道官）を危惧しており、友好国ロシアのラブロフ外相を２２日に招いて対米連携を誇示する見通し。「新冷戦」の危機にあるとも言われる米中が今後、同盟国や友好国を引き込んで対峙する構図が浮かび上がる。中国外務省の報道局長は１８日の記者会見で、ラブロフ氏が２２～２３日に訪中し、王毅外相と国際・地域問題などを協議すると発表した。ロシア外務省は７月に迎える中ロ善隣友好協力条約締結２０周年に向け「双方は意思疎通を一層強化する必要がある」と強調した。習近平国家主席とプーチン大統領の会談に向けた調整も行うとみられる。バイデン政権は、中ロを「戦略的競合国」と位置付けて対立したトランプ前政権の強硬姿勢を現時点ではほぼ踏襲。バイデン大統領はプーチン氏について「殺人者」という認識すら示した。米ロ関係の悪化につれて中ロの対米共闘路線が深まる雲行きだ。ブリンケン米国務長官は１８日、訪問先の韓国で北朝鮮の核問題解決に関し、後ろ盾である中国の役割に期待感を表明。中国外務省の趙副報道局長は１８日、「引き続き建設的な役割を果たす」と応じた。ただ、中国はトランプ前政権と渡り合うため北朝鮮への影響力を駆使した経緯がある。国連安保理常任理事国の中ロは対北朝鮮経済制裁の緩和を一致して求めており、中ロと北朝鮮が米国をにらんで結束を高める展開も予想される。一方、国際社会は米中  二つの経済大国の間でバランスの取り方に  苦慮 している。シンガポールのリー・シェンロン首相は今月、英ＢＢＣのインタビューで「米中のどちらとも非常に強く広範な結び付きがあり、二者択一は不可能だ。これはシンガポールだけのジレンマではない」と指摘した。",
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 1,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 4,
    assignmentType: "translate",
    name: "한->중 번역과제",
    description: "설명없음",
    textFile:
      "간편식 시장이 이처럼 확산되는 이유로 1인 및 맞벌이 가구의 급증과 함께 밀레니얼 세대의라이프스타일을 언급할 수 있다. 밀레니얼 세대는 보통 1980년대부터 2000년대 초반 출생자를지칭하는데, 이들이 결혼 적령기에 들어서면서 탄생한 ‘밀레니얼 가족’에 주목할 필요가 있다.이들의 라이프스타일을 설명하는 중요한 키워드 중 하나가 ‘효율성’이기 때문이다. 밀레니얼들은직접 맛있는 요리를 하고 싶지만, 재료 손질과 장보기 등 시간이 걸리는 번거로운 절차는 생략하고싶어한다. 이러한 이중적 욕구가 가정간편식을 선택하게 하는 것이다. 특히 재료가 다 손질되어있는 밀키트는 불편을 최소화하면서도 요리의 즐거움을 적절히 누릴 수 있게 한다.한편 집의 중요성이 점차 커지고 있다는 점도 가정간편식 시장의 성장을 견인하는 요인이다.코로나바이러스의 확산이 장기화되면서 집이 일하는 공간, 학습의 공간, 취미 생활의 공간 등 모든생활의 플랫폼이 되고 있다. 집 안에 홈시어터를 설치해 영화관 못지않은 영상과 사운드를누리기도 하고, 홈트레이닝을 위한 공간을 별도로 만들기도 한다. 집에서 밥을 먹을 수밖에 없는상황에서 가정간편식은 외식 기분을 내기 위한 중요한 대안이다. 스키야키, 연어 참치장,양장피처럼 재료 준비가 번거로운 메뉴도 동봉된 레시피 카드에 적힌 순서대로 따라 하기만 하면적절한 분량으로 손질된 재료들로 간단하게 조리해 즐길 수 있다.  초기의 가정간편식은 간편함과 가격 경쟁력이 강조되었지만, 요즘에는 소비의 주체가 다인가구로 확장되고 있고 더 나아가 시니어 층으로 확대되는 추세여서 가격대가 다소 높은 고급메뉴도 잘 팔리고 있다. 앞으로는 유아를 위한 이유식이나 환자를 위한 유동식 등 다양한 영역으로확장될 가능성도 있다. 간편식이 간단한 한 끼를 넘어 어디까지 확장될 수 있을지 지켜볼 일이다",
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 5,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 5,
    assignmentType: "translate",
    name: "중->한 번역과제",
    description: "설명없음",
    textFile:
      "活的通透的人，会是一个什么样的人 我觉得我算是一个活得比较通透的人了吧。我儿子说他这辈子可能不想结婚了…我说没关系，只要你自己考虑好就行，我不反对，但也不支持、不鼓励，一切顺其自然。做一个合格的伴侣和一个合格的父母实在太难了，如果没有准备好，暂时单身也许是一个不错的选择。我51岁开始过上了躺平的退休生活，养老金不到3000元，身边很多人想不明白，为啥要放弃待遇还过得去的工作，年富力强的年龄便不思进取？我觉得钱是挣不完的，前几十年的辛苦为了啥？不就是为了在可以退休的年龄过上悠闲自得的退休生活吗？钱不够花？哪就降低物质欲望，在力所能及的范围内享受生活。金钱固然越多越好，但是再多的金钱也买不来时间，尤其是享受生活的时间。享受生活一定要花很多钱吗？是，也不是。有钱人可以用钱来证明自己的存在，我是穷人，一本书，一杯茶，二顿合口味的家常便饭也可以是很充实并快乐的一天。我单身20多年，有人说等你老了就知道有个老伴儿的好处了…首先，夫妻二人总是有一个人要先走，剩下的那个人是不是还是一个人等死？其次，我生活能自理的时候无需人伺候，等我生活不能自理的时候，二婚的老公能伺候我？别人信不信我不好说，反正我不信。不是不相信爱情，是我更愿意相信人性，因为人性的特点就是趋利避害。年轻时为了爱可以不顾一切，人到中年，就只剩下算计和利益交换。千万不要觉得别人比你傻，我们都是普通人，智商都差不多，谁都不比谁聪明，谁也都不比谁傻，只是有人看透，有人不愿意看透。有人把面子看得比天还大，为了面子可以在一无所有或者倾其所有的情况下贷款买车。为了面子可以省吃俭用几个月甚至更长的时间，就为买一个名牌包包。……对我而言，面子是最没用的东西。别人看得起我，我口袋里不会多一毛钱。别人觉得我混得好的时候，我也不会多活一天。什么是幸福？我觉得可以自由选择自己想要过的生活，便是幸福。什么叫活得通透？我自己的理解是：看淡生死，淡泊名利，珍惜眼前，活在当下，不贪不怨，坦然接受生活中的不完美，纵然生活中有很多的黑暗和阴影，但始终心向阳光，努力做最好的自己。",
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 6,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 6,
    assignmentType: "translate",
    name: "한->중 번역과제",
    description: "설명없음",
    textFile:
      "<팬데믹과 한국 사회의 대전환> 포스트 코로나 시대, 핵심 과제는 불평등 해소다.팬데믹 상황에서 미국의 계급은 4부류로 나뉘게 되었다.미국 빌 클린턴 행정부 시절 노동부 장관을 역임했던 로버트 라이시 교수의 말이다. 1.	원격(the remote)계급: 재택근무를 할 수 있고 앞으로 코로나19를 피해 멀리 안전한 곳으로 갈 수 있는 사람들 2.	핵심(the essential)계급: 생산과 서비스의 핵심을 담당하고 있는 일종의 정규직에 가까운 사람들  3.	실업(the unpaid)계급: 대체 가능한 계층이라 일자리가 들쭉날쭉한 사람들  4.	망각(the forgotten)계급: 교도소나 병원, 혹은 요양원 등에 갇혀 있는 사람들 한국도 미국과 크게 다르지 않다. 한국에서 원격 계급에 속하는 사람들은 전문직·관리직 등의 인력들로 임금 변화가 없고 코로나19 위기를 비교적 잘 이겨내고 있다. 핵심 계급은 경찰관, 소방관, 의료 관련 종사자, 배달 노동자들 등으로 일자리를 잃지는 않지만, 전염병 감염 위험에 노출되어 있다. 실업 계급은 소매점·식당 종업원, 여행가이드 등 서비스업 종사자들로 실직하거나 무급 휴가를 강요받는 사람들이다. 마지막으로 망각 계급에 속하는 재소자, 노숙자들은 집단생활로 거리두기가 어려워 감염에 취약하다. 지금 우리가 겪고 있는 팬데믹은 핵 위협이나 기후 변화 혹은 스모그처럼 모든 사람들이 피하기 어려운 위험과는 성격이 다르다.왜냐하면 코로나19에 감염되는 사람들과 그렇지 않는 사람들 사이에 계층적 차이가 나타날 수 있기 때문이다.팬데믹은 사람과 사람의 접촉에 의해 감염이 이루어지기 때문에 감염되는 사람과 그렇지 않는 사람 간의 차이가 발생할 수밖에 없다.팬데믹 자체가 불평등하듯 팬데믹은 사회적,경제적 불평등과 양극화를 더 심화할 가능성이 높다. 그렇다면 팬데믹은 불평등을 어떻게 심화할까? 사회적 불평등이 그것이다. 결국 교육을 받는 수준에서 성과 격차가 우리 아이들의 직업에 대한 접근을 결정한다면 사회 이동 가능성은 점점 줄어들 수밖에 없을 것이다. 그리고 경제적 불평등도 있다. 경제가 성장할수록 소득 불평등이 심화하는 구조적인 현상이 드러나고 있다.그 결과 소득이 더욱 불평등해진다. 코로나19는 우리 사회가 이미 안고 있던 여러 가지 구조적 문제를 부각시켰다.그래서 이런 문제들에 대해 어떻게 대처할 것인가 하는 고민이 코로나19가 지나가고 난 다음에 우리가 어떤 사회를 원하는 것인가와 밀접한 관계가 있다. ",
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 7,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 7,
    assignmentType: "translate",
    name: "중->한 번역과제",
    description: "설명없음",
    textFile:
      "后疫情时代，中国面临的机遇与挑战看多中国，相信价值，投资中国的机遇显而易见。无论从发展前景，还是疫情中中国经济表现出来的韧性，在大的国际环境下，中国可能是今年唯一保持经济正增长的国家，“中国的长期经济增长潜力毫无疑问。未来的投资机会用恒复团队总结的一句话就是未来投资看中国，中国投资看权益，权益投资看价值。”从资产配置的角度来看，资本市场正迎来大类资产从房地产和固定收益向权益类资产配置转移的历史性窗口期。中国资本市场也正迎来一系列制度红利：注册制的推行以及金融的开放与不断创新。恒复一直以来就聚焦在四大领域：大消费、大健康、科技、先进制造，未来这四大领域的机会长期存在。当然如今在疫情的大环境下，存在许多的风险因素，全球经济处于衰退趋势，尤其是对欧美国家来说风险更甚，美国整体资产处于高估状态。中国也存在一定的风险，在国内经济承压的背景下，资本市场中部分板块，例如消费、医药和科技中一些细分行业存在着价值高估的现象及泡沫风险。但危中存机，我们应正视风险，抓住时代机遇，长期投资中国优质资产。对于我们一直研究的四大板块，我们认为存在着非常重大的长期投资机会。对于消费来说，这是一个又长又缓的上升坡道，经济全球化视野下来看，中国的人均GDP处在9600美元的水平，相当于美国80年代，这个阶段正是消费升级的阶段，消费将迎来长期的投资机遇。对于医药来说，中国逐步进入老年化时代，这会进一步刺激医药及健康的消费。同时医改政策会让那些创新型龙头企业，以及有核心竞争力和成本制造力的企业快速集中，市场通过优胜劣汰，头部效应将会更加明显。对于先进制造业，中国的制造业正在迈向由大变强的过程。全球来看，中国是很多细分行业最大的市场，市场驱动带来了产业转移，也因为国内企业的进口替代具有较大优势，中国在积累中逐步转向技术驱动创新驱动高附加值的转型升级中。同时，中国制造业发展这么多年，还培育了一批优秀的企业家。所以从这些角度来说，先进制造业也存在着显著的投资机会。从科技角度来看，这是一条黄金赛道，每次大的工业革命都会带来GDP大幅度的跃升。在经济结构的变迁中，科技占GDP的比重将越来越显著。中国在几十年的发展中，科技企业在不断地沉淀与崛起，在国内本身有着庞大的资金支持加上人才集聚的基础上，会带动一批有追求的企业由弱转强，出现更多例如华为这种科技企业。同时在科技行业中，国家意志也尤其显著。",
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 10,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 8,
    assignmentType: "translate",
    name: "영->한 번역과제",
    description: "설명없음",
    textFile:
      "The location, the opening credits tell us, is “Somewhere in Northern Italy.” Such vagueness is deliberate: the point of a paradise is that it could exist anywhere but that, once you reach the place, it brims with details so precise in their intensity that you never forget them. Thus it is that a young American named Oliver (Armie Hammer) arrives, dopey with jet lag, at the house of Professor Perlman (Michael Stuhlbarg) and his Italian wife, Annella (Amira Casar), whose custom is to spend their summers there and also to return for Hanukkah. (Like them, Oliver is Jewish; a closeup shows a Star of David hanging from a chain around his neck.) The Professor, an American expert in classical archeology, requires an annual assistant, and Oliver is this year’s choice. “We’ll have to put up with him for six long weeks,” Annella says, with a sigh. Not long enough, as it turns out. You can pack a whole lifetime into six weeks.",
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 1,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
  {
    id: 9,
    assignmentType: "translate",
    name: "영->한 번역과제",
    description: "설명없음",
    textFile:
      '"As Long as You Love Me" is a song by Canadian singer Justin Bieber, from his third studio album, Believe (2012). The track features American rapper Big Sean. It was written by Eric H, and was produced by Rodney "Darkchild" Jerkins and Andre Lindal. It was first released on July 10, 2012, as a promotional single from the album, and one month later it was released as the albums second single. The song has since charted in the United Kingdom, first at number thirty as a promotional single with first-week sales of 11,598, and then after being released as a single it improved its position on the UK Singles Chart, reaching number 22.[3] On Billboards Rhythmic Airplay Chart, the single reached number one, giving Bieber his first number one single on an American airplay music chart.[4] It peaked at number six on the Billboard Hot 100. It also reached the number one position on Billboards Dance/Mix Show Airplay chart, making Bieber the fifth Canadian artist to reach that position after Martin Solveig featuring Dragonettes "Hello" in 2011.[5] The song has sold 2,240,000 copies in the US as December 2012.[6] The music video features actor Michael Madsen.',
    dueDateTime: new Date().toISOString().slice(0, -8),
    weekNumber: 2,
    feedbackCategoryIds: [0, 1, 2, 3],
    maxPlayCount: 0,
    isPublic: true,
    maxScore: 100,
    playbackRate: 1,
    sequentialRegions: [],
  },
];
