import assignmentService from "./assignmentService";
import { feedbackService } from "./feedbackService";
import { feedbacks } from "./feedbackService";
import { users } from "./userService";

const submissionService = {
  async getAll(): Promise<Submission[]> {
    return Promise.all(
      submissions.map(
        async ({ assignmentId, feedbackIds, studentId, ...rests }) => ({
          assignment: await assignmentService.getOne(assignmentId),
          feedbacks: await Promise.all(
            feedbackIds.map(async (id) => await feedbackService.getOne(id))
          ),
          student: users[studentId],
          ...rests,
        })
      )
    );
  },
  async getOne(id: number): Promise<Submission> {
    const { assignmentId, feedbackIds, studentId, ...rests } = submissions[id];
    return Promise.resolve({
      assignment: await assignmentService.getOne(assignmentId),
      feedbacks: await Promise.all(
        feedbackIds.map(async (id) => await feedbackService.getOne(id))
      ),
      student: users[studentId],
      ...rests,
    });
  },
  async postOne(dto: CreateSubmissionDto) {
    const newSubmission: SubmissionModel = {
      id: submissions.length,
      generalReview: "",
      score: 0,
      isGraded: false,
      feedbackIds: [],
      ...dto,
    };
    submissions.push(newSubmission);
    return Promise.resolve(newSubmission);
  },
  async putOne(dto: PutSubmissionDto) {
    submissions = submissions.map((s) =>
      s.id === dto.id ? { ...s, ...dto } : s
    );
    return Promise.resolve(true);
  },
};

export default submissionService;

let submissions: SubmissionModel[] = [
  {
    id: 0,
    textFile:
      "연령 추정 알고리즘은 계층적 접근 방식을 실현합니다(그림 10). 첫째, 입력 조각은 18세 미만, 18-45세, 45세 이상의 세 연령 그룹으로 나누어 집니다. 둘째, 이 단계의 결과는 각각 10년 단위로 제한되는 7개의 작은 그룹으로 세분화됩니다. 따라서, 다중 클래스 분류 문제는 “일대다” 이진 분류자 집합으로 감소합니다. 따라서 이 분류자는 관련 클래스를 기반으로 이미지의 순위를 매기고, 이러한 순위 히스토그램을 분석하여 최종 결정을 내립니다. 이 BC들은 2단계 접근 방식을 사용하여 구성됩니다. 앞에서 설명한 대로 이미지는 적응형 특징 공간으로 처음 전환한 후 RBF 커널이 있는 지원 벡터 머신을 통해 분류됩니다. 입력 조각은 밝기 특성이 균일한 척도로 정렬되고 변환되도록 사전 처리됩니다. 이 사전 처리 단계에는 색상 공간 변환 및 스케일링이 포함되며, 두 작업 모두 성별 인식 알고리즘에 사용된 과정과 유사합니다. 특징은 각 색상 구성 요소에 대해 계산되고 결합되어 균일한 특징 벡터를 형성합니다.",
    score: 100,
    assignmentId: 0,
    feedbackIds: feedbacks
      .filter((f) => f.submissionId === 0)
      .map(({ id }) => id),
    generalReview: "",
    isGraded: true,
    isTemporal: false,
    playCount: 0,
    playbackRate: 1,
    studentId: 0,
  },
  {
    id: 1,
    textFile:
      '오프닝 크레딧이 말해주는 장소는 "북이탈리아의 어딘가"입니다. 그러한 모호함은 의도적이다. 낙원의 요점은 낙원이 어디에든 존재할 수 있다는 것이다. 낙원은 일단 그곳에 도달하면 그 강렬함이 너무 정밀해서 절대 잊지 못할 정도로 그 세밀함이 넘쳐난다. 그래서 올리버라는 젊은 미국인이 펄만 교수와 그의 이탈리아인 아내인 안넬라(아미라 카사르)의 집에 도착해 시차 적응증을 앓고 있다. 그의 목에.) 미국의 고전 고고학 전문가인 교수는 연간 조수가 필요한데, 올리버가 올해의 선택이다. 안넬라는 한숨을 쉬며 "우리는 6주 동안 그를 참아야 할 것입니다."라고 말한다. 알고 보니 오래 걸리지 않았다. 당신은 평생을 6주로 포장할 수 있습니다.',
    score: 100,
    assignmentId: 8,
    feedbackIds: feedbacks
      .filter((f) => f.submissionId === 0)
      .map(({ id }) => id),
    generalReview: "",
    isGraded: true,
    isTemporal: false,
    playCount: 0,
    playbackRate: 1,
    studentId: 0,
  },
  {
    id: 2,
    textFile:
      '"Long as You Love Me"는 캐나다 가수 저스틴 비버의 세 번째 정규 앨범인 Believe (2012)에 수록된 곡이다. 이 트랙에는 미국인 래퍼 빅 숀이 등장한다. 에릭 H가 썼고 로드니 "다크차일드" 저킨스와 안드레 린달이 제작했다. 이 앨범은 2012년 7월 10일에 홍보용 싱글로 처음 발매되었고, 한 달 후에 앨범의 두 번째 싱글로 발매되었다. 이후 영국에서 차트 1위를 차지했으며, 첫 주 판매량 11,598장의 프로모션 싱글로 처음 30위에 올랐고, 싱글로 발매된 후 영국 싱글 차트에서 22위에 오르며 입지를 강화했다. 빌보드의 리듬 에어플레이 차트에서, 이 싱글은 비버에게 미국 공중파 음악 차트에서 첫 번째 싱글 1위를 안겨주었다. 빌보드 핫 100에서 6위로 정점을 찍었다. 빌보드의 댄스/믹스 쇼 에어플레이 차트에서도 1위에 올랐으며, 비버는 2011년 드라게트의 "Hello"를 피처링한 마틴 솔빅에 이어 다섯 번째 캐나다 아티스트가 되었다. 이 곡은 2012년 12월 미국에서 224만 장이 팔렸다. 뮤직비디오에는 배우 마이클 매드슨이 등장한다.',
    score: 100,
    assignmentId: 9,
    feedbackIds: feedbacks
      .filter((f) => f.submissionId === 0)
      .map(({ id }) => id),
    generalReview: "",
    isGraded: true,
    isTemporal: false,
    playCount: 0,
    playbackRate: 1,
    studentId: 0,
  },
];
