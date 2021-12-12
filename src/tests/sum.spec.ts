import { set, reset } from "mockdate";

type EventStatus = { status: string };
class CheckLastEventStatus {
  constructor(
    private readonly loadLastEventRepository: ILoadLastEventRepository
  ) {}
  async perform({ groupId }: { groupId: string }): Promise<EventStatus> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupId });
    if (event === undefined) return { status: "done" };
    const now = new Date();
    return event.endDate > now ? { status: "active" } : { status: "inReview" };
  }
}

type LastEvent = { endDate: Date } | undefined;

interface ILoadLastEventRepository {
  loadLastEvent: (input: { groupId: string }) => Promise<LastEvent>;
}
class LoadLastEventRepositorySpy implements ILoadLastEventRepository {
  groupId?: string;
  callsCount = 0;
  output: LastEvent;
  async loadLastEvent(input: { groupId: string }): Promise<LastEvent> {
    const { groupId } = input;
    this.groupId = groupId;
    this.callsCount++;
    return this.output;
  }
}

type SutOutput = {
  sut: CheckLastEventStatus;
  loadLastEventRepository: LoadLastEventRepositorySpy;
};

const makeSut = (): SutOutput => {
  const loadLastEventRepository = new LoadLastEventRepositorySpy();
  const sut = new CheckLastEventStatus(loadLastEventRepository);
  return { sut, loadLastEventRepository };
};

describe("CheckLastEventStatus", () => {
  beforeAll(() => {
    set(new Date());
  });
  afterAll(() => {
    reset();
  });
  it("should get last event data", async () => {
    const { sut, loadLastEventRepository } = makeSut();

    await sut.perform({ groupId: "any_group_id" });

    expect(loadLastEventRepository.groupId).toBe("any_group_id");
    expect(loadLastEventRepository.callsCount).toBe(1);
  });
  it("should return status done when group has no event", async () => {
    const { sut, loadLastEventRepository } = makeSut();
    loadLastEventRepository.output = undefined;

    const eventStatus = await sut.perform({ groupId: "any_group_id" });

    expect(eventStatus.status).toBe("done");
  });
  it("should return status active when now is before event end time", async () => {
    const { sut, loadLastEventRepository } = makeSut();
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() + 1),
    };

    const eventStatus = await sut.perform({ groupId: "any_group_id" });

    expect(eventStatus.status).toBe("active");
  });

  it("should return status inReview when now is after event end time", async () => {
    const { sut, loadLastEventRepository } = makeSut();
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - 1),
    };

    const eventStatus = await sut.perform({ groupId: "any_group_id" });

    expect(eventStatus.status).toBe("inReview");
  });
});
